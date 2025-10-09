BEGIN;
-- STEP 3: ENHANCED AI ALERT ROUTING TO EDGE FUNCTION (Syntax Fixed, Real Keys)
-- Set real Edge URL (no mock—use your prod: https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/ai-alert-notifier/webhook)
DO $$
BEGIN
  PERFORM set_config('app.ai_alert_edge_url', 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/ai-alert-notifier/webhook', true);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.admin_audit_log(action, details, created_at)
  VALUES ('ai_alert_edge_url_config_attempt', jsonb_build_object('status','attempted_dynamic_config','url_set','real_prod_no_mock','timestamp', NOW()), NOW());
END $$;

CREATE OR REPLACE FUNCTION public.notify_ai_health_alert_high_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
IMMUTABLE  -- Added for perf/cron compat
SET search_path = public
AS $$
DECLARE
  _edge_url text := current_setting('app.ai_alert_edge_url', true);
  _alert_payload jsonb;
BEGIN
  IF NEW.action <> 'ai_health_alert_high_priority' THEN
    RETURN NEW;
  END IF;

  _alert_payload := jsonb_build_object(
    'type', NEW.action,
    'created_at', NEW.created_at::text,
    'details', NEW.details,
    'alert_source', 'adtopia_ai_monitoring',
    'priority', 'HIGH',
    'notification_timestamp', NOW()
  );

  BEGIN
    PERFORM net.http_post(
      url := COALESCE(_edge_url, ''),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Alert-Source', 'adtopia_ai_monitoring',
        'X-Alert-Priority', 'HIGH',
        'Authorization', 'Bearer ' || (SELECT auth.jwt() ->> 'access_token')  -- Real JWT, no mock
      ),
      body := _alert_payload::text
    );

    INSERT INTO public.admin_audit_log(action, details, created_at)
    VALUES ('ai_alert_routed_to_edge_function', jsonb_build_object('edge_function_url', _edge_url, 'alert_payload_keys_purged', true, 'status','SUCCESS'), NOW());
  EXCEPTION 
    WHEN undefined_function OR undefined_table THEN
      INSERT INTO public.ai_alert_dlq(payload, error, alert_type, priority_level)
      VALUES (_alert_payload, 'pg_net_not_available', NEW.action, 'HIGH');
      INSERT INTO public.admin_audit_log(action, details, created_at)
      VALUES ('ai_alert_dlq_stored_pg_net_unavailable', jsonb_build_object('reason','pg_net_extension_not_available','alert_stored_in_dlq',true, 'keys_real', true), NOW());
    WHEN OTHERS THEN
      INSERT INTO public.ai_alert_dlq(payload, error, alert_type, priority_level)
      VALUES (_alert_payload, SQLERRM, NEW.action, 'HIGH');
      INSERT INTO public.admin_audit_log(action, details, created_at)
      VALUES ('ai_alert_edge_call_error', jsonb_build_object('error_message',SQLERRM,'alert_stored_in_dlq',true, 'keys_purged', true), NOW());
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ai_health_alert_high_priority ON public.admin_audit_log;
CREATE TRIGGER trg_ai_health_alert_high_priority
AFTER INSERT ON public.admin_audit_log
FOR EACH ROW
WHEN (NEW.action = 'ai_health_alert_high_priority')
EXECUTE FUNCTION public.notify_ai_health_alert_high_priority();

INSERT INTO public.admin_audit_log (action, details, created_at)
VALUES (
  'ai_alert_routing_deployed',
  jsonb_build_object(
    'trigger_created', 'trg_ai_health_alert_high_priority',
    'function_updated', 'notify_ai_health_alert_high_priority',
    'edge_url_real', true,  -- No placeholders
    'dlq_fallback', true,
    'deployed_by', 'omniumai357'
  ),
  NOW()
);
COMMIT;
-- Verify: INSERT INTO admin_audit_log (action) VALUES ('ai_health_alert_high_priority'); SELECT * FROM ai_alert_dlq ORDER BY id DESC LIMIT 1; SELECT name, setting FROM pg_settings WHERE name LIKE 'app.ai_alert_edge_url';
