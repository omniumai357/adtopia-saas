import { NextRequest, NextResponse } from 'next/server';
import { createHarvester, DEFAULT_HARVEST_CRITERIA } from '@/lib/craigslistHarvester';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const location = searchParams.get('location') || 'Modesto';
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    const harvester = createHarvester({
      ...DEFAULT_HARVEST_CRITERIA,
      location
    });

    switch (action) {
      case 'harvest':
        const ads = await harvester.harvestAds(limit);
        await harvester.storeHarvestedAds(ads);
        return NextResponse.json({
          success: true,
          data: {
            harvested_count: ads.length,
            ads: ads.slice(0, 10), // Return first 10 for preview
            message: `Successfully harvested ${ads.length} unoptimized ads`
          }
        });

      case 'stats':
        const stats = await harvester.getHarvestStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "harvest" or "stats"'
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in harvester API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, service_types, max_age_days, min_optimization_score } = body;

    const harvester = createHarvester({
      location: location || 'Modesto',
      service_types: service_types || DEFAULT_HARVEST_CRITERIA.service_types,
      max_age_days: max_age_days || 7,
      min_optimization_score: min_optimization_score || 30
    });

    const ads = await harvester.harvestAds(100);
    await harvester.storeHarvestedAds(ads);

    return NextResponse.json({
      success: true,
      data: {
        harvested_count: ads.length,
        criteria: {
          location,
          service_types,
          max_age_days,
          min_optimization_score
        },
        message: `Successfully harvested ${ads.length} ads with custom criteria`
      }
    });
  } catch (error: any) {
    console.error('Error in harvester POST API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
