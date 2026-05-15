export function layerNameToKey(layerName: string): string {
  return layerName.replace(/\//g, '.');
}

export function isTrackedLayer(layerName: string): boolean {
  return layerName.includes('/');
}
