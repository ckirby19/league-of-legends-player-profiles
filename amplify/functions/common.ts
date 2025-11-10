export function getRoutingValue(region: string): string {
  return routingMap[region] ?? 'americas';
}

export const routingMap: Record<string, string> = {
  na1: 'americas',
  br1: 'americas',
  la1: 'americas',
  la2: 'americas',
  euw1: 'europe',
  eun1: 'europe',
  tr1: 'europe',
  ru: 'europe',
  kr: 'asia',
  jp1: 'asia',
  oc1: 'sea',
  ph2: 'sea',
  sg2: 'sea',
  th2: 'sea',
  tw2: 'sea',
  vn2: 'sea',
};

export const anthropicModel = "anthropic.claude-3-haiku-20240307-v1:0";
export const AWS_REGION = process.env.AWS_REGION || "eu-west-2";