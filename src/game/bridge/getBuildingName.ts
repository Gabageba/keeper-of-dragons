import ContentLoader from '../systems/ContentLoader';

export const getBuildingName = (buildingId: string): string =>
  ContentLoader.building(buildingId)?.name ?? buildingId;
