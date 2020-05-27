import platform from 'platform'

export function calcGainInverse (distance: number, refDistance: number, rolloffFactor: number) {
  return refDistance / (refDistance + rolloffFactor * (Math.max(distance, refDistance) - refDistance))
}

export function calcGainExponential (distance: number, refDistance: number, rolloffFactor: number) {
  // pow((Math.max(distance, refDistance) / refDistance, -rolloffFactor)
  return (Math.max(distance, refDistance) / refDistance) ** (-rolloffFactor)
}

export function detectSupportBrowser () {
  const result = {
    isMobile: false,
    isSupported: false
  };

  if (platform.os && platform.os.family) {
    result.isMobile = ['ios', 'android', 'webos', 'windows phone'].includes(platform.os.family.toLowerCase())
  }

  const browserName = platform.name ? platform.name.toLowerCase() : '';
  const isHeadlessChrome = platform.ua !== undefined && platform.ua.toLowerCase().indexOf('headlesschrome') > -1;
  result.isSupported = !result.isMobile && (isHeadlessChrome || ['chrome', 'firefox'].includes(browserName));

  return result
}

export function getCursorPosition (from: MouseEvent | TouchEvent): { x: number, y: number } {
  if (window.TouchEvent && from instanceof window.TouchEvent) {
    const touch = from.touches.item(0)!;
    return { x: touch.clientX, y: touch.clientY }
  } else {
    from = from as MouseEvent;
    return { x: from.clientX, y: from.clientY }
  }
}
