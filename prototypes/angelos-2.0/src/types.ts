export type ResourceType = 'vpc' | 'subnet' | 'instance' | 'database' | 'storage';

export interface CloudResource {
  id: string;
  name: string;
  type: ResourceType;
  config: Record<string, any>;
  parentId?: string; // Subnets belong to VPCs, Instances belong to Subnets
}

export interface CloudArchitecture {
  name: string;
  provider: 'aws' | 'gcp' | 'azure';
  resources: CloudResource[];
}
