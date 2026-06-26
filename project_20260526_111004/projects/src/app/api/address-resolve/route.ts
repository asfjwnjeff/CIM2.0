import { NextRequest, NextResponse } from 'next/server';

// 高德地图 Web 服务 API Key（从环境变量或硬编码读取）
const AMAP_API_KEY = process.env.AMAP_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, city } = body || {};

    if (!address?.trim()) {
      return NextResponse.json({ success: false, error: '地址不能为空' }, { status: 400 });
    }

    if (!AMAP_API_KEY) {
      return NextResponse.json({
        success: false,
        error: '未配置高德地图 API Key，请在环境变量中设置 AMAP_API_KEY',
        degraded: true,
      }, { status: 500 });
    }

    // 构建请求参数：拼接城市名提高精度
    let fullAddress = address.trim();
    if (city?.trim()) {
      fullAddress = `${city.trim()}${fullAddress}`;
    }

    const params = new URLSearchParams({
      key: AMAP_API_KEY,
      address: fullAddress,
      output: 'JSON',
    });

    const resp = await fetch(`https://restapi.amap.com/v3/geocode/geo?${params.toString()}`);
    const geoData = await resp.json();

    if (geoData.status !== '1' || !geoData.geocodes?.length) {
      return NextResponse.json({
        success: true,
        data: {
          province: '',
          city: '',
          district: '',
          longitude: 0,
          latitude: 0,
          accuracy: 'unresolved' as const,
          formattedAddress: '',
        },
      });
    }

    const geo = geoData.geocodes[0];
    const location = geo.location?.split(',') || [];
    const lng = parseFloat(location[0]) || 0;
    const lat = parseFloat(location[1]) || 0;

    // 高德返回的 addressComponent 可能为空，用 level 判断精度
    let accuracy: 'precise' | 'approximate' | 'unresolved' = 'unresolved';
    if (geo.level === '门牌号' || geo.level === '单元号' || geo.level === '楼栋号') {
      accuracy = 'precise';
    } else if (geo.level === '道路' || geo.level === '区县' || geo.level === '乡镇' || geo.level === '村庄') {
      accuracy = 'approximate';
    }

    return NextResponse.json({
      success: true,
      data: {
        province: geo.province || '',
        city: geo.city || '',
        district: geo.district || '',
        longitude: lng,
        latitude: lat,
        accuracy,
        formattedAddress: geo.formatted_address || '',
      },
    });
  } catch (error) {
    console.error('POST /api/address-resolve error:', error);
    return NextResponse.json({ success: false, error: '地址解析失败' }, { status: 500 });
  }
}
