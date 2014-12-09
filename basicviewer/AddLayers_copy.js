/* This is the place to define the layers you want available to users in the Contents > Add Layers pane.
You can start with the script in AGStoJSON (sibling to basicviewer folder) to crawl your ArcGIS Server and output a JSON object. And/or you can edit
the file manually. Services can be from anywhere and different servers. Only AGS map, image, and feature layer services, and WMS are supported at this time.
KML can be added, however it has not been fully implemented in the Legend tree.
 */
{
	"name" : "geodata.md.gov",
	"id" : "root",
	"children" : [{
			"name" : "Agriculture",
			"id" : "Agriculture",
			"url" : "http://geodata.md.gov/imap/rest/services/Agriculture/",
			"children" : [{
					"name" : "MD_AgriculturalDesignations",
					"id" : "MD_AgriculturalDesignations",
					"url" : "http://geodata.md.gov/imap/rest/services/Agriculture/MD_AgriculturalDesignations/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Biota",
			"id" : "Biota",
			"url" : "http://geodata.md.gov/imap/rest/services/Biota/",
			"children" : [{
					"name" : "MD_Biomass (Image Service)",
					"id" : "MD_Biomass",
					"url" : "http://geodata.md.gov/imap/rest/services/Biota/MD_Biomass/ImageServer/",
					"type" : "ImageServer"
				}, {
					"name" : "MD_Biomass",
					"id" : "MD_Biomass",
					"url" : "http://geodata.md.gov/imap/rest/services/Biota/MD_Biomass/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_CanopyCover (Image Service)",
					"id" : "MD_CanopyCover",
					"url" : "http://geodata.md.gov/imap/rest/services/Biota/MD_CanopyCover/ImageServer/",
					"type" : "ImageServer"
				}, {
					"name" : "MD_CanopyCover",
					"id" : "MD_CanopyCover",
					"url" : "http://geodata.md.gov/imap/rest/services/Biota/MD_CanopyCover/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Finfish",
					"id" : "MD_Finfish",
					"url" : "http://geodata.md.gov/imap/rest/services/Biota/MD_Finfish/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_GreenInfrastructure",
					"id" : "MD_GreenInfrastructure",
					"url" : "http://geodata.md.gov/imap/rest/services/Biota/MD_GreenInfrastructure/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_LivingResources",
					"id" : "MD_LivingResources",
					"url" : "http://geodata.md.gov/imap/rest/services/Biota/MD_LivingResources/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Shellfish",
					"id" : "MD_Shellfish",
					"url" : "http://geodata.md.gov/imap/rest/services/Biota/MD_Shellfish/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_SubmergedAquaticVegetation",
					"id" : "MD_SubmergedAquaticVegetation",
					"url" : "http://geodata.md.gov/imap/rest/services/Biota/MD_SubmergedAquaticVegetation/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Boundaries",
			"id" : "Boundaries",
			"url" : "http://geodata.md.gov/imap/rest/services/Boundaries/",
			"children" : [{
					"name" : "MD_ElectionBoundaries",
					"id" : "MD_ElectionBoundaries",
					"url" : "http://geodata.md.gov/imap/rest/services/Boundaries/MD_ElectionBoundaries/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_MarineBoundaries",
					"id" : "MD_MarineBoundaries",
					"url" : "http://geodata.md.gov/imap/rest/services/Boundaries/MD_MarineBoundaries/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_PhysicalBoundaries",
					"id" : "MD_PhysicalBoundaries",
					"url" : "http://geodata.md.gov/imap/rest/services/Boundaries/MD_PhysicalBoundaries/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_PoliticalBoundaries",
					"id" : "MD_PoliticalBoundaries",
					"url" : "http://geodata.md.gov/imap/rest/services/Boundaries/MD_PoliticalBoundaries/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_StateMask",
					"id" : "MD_StateMask",
					"url" : "http://geodata.md.gov/imap/rest/services/Boundaries/MD_StateMask/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "BusinessEconomy",
			"id" : "BusinessEconomy",
			"url" : "http://geodata.md.gov/imap/rest/services/BusinessEconomy/",
			"children" : [{
					"name" : "MD_EARNPartners2014",
					"id" : "MD_EARNPartners2014",
					"url" : "http://geodata.md.gov/imap/rest/services/BusinessEconomy/MD_EARNPartners2014/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_IncentiveZones",
					"id" : "MD_IncentiveZones",
					"url" : "http://geodata.md.gov/imap/rest/services/BusinessEconomy/MD_IncentiveZones/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Demographics",
			"id" : "Demographics",
			"url" : "http://geodata.md.gov/imap/rest/services/Demographics/",
			"children" : [{
					"name" : "MD_AmericanCommunitySurvey",
					"id" : "MD_AmericanCommunitySurvey",
					"url" : "http://geodata.md.gov/imap/rest/services/Demographics/MD_AmericanCommunitySurvey/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_CensusBoundaries",
					"id" : "MD_CensusBoundaries",
					"url" : "http://geodata.md.gov/imap/rest/services/Demographics/MD_CensusBoundaries/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_CensusData",
					"id" : "MD_CensusData",
					"url" : "http://geodata.md.gov/imap/rest/services/Demographics/MD_CensusData/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_CensusDesignatedAreas",
					"id" : "MD_CensusDesignatedAreas",
					"url" : "http://geodata.md.gov/imap/rest/services/Demographics/MD_CensusDesignatedAreas/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Elevation",
			"id" : "Elevation",
			"url" : "http://geodata.md.gov/imap/rest/services/Elevation/",
			"children" : [{
					"name" : "MD_Bathymetry",
					"id" : "MD_Bathymetry",
					"url" : "http://geodata.md.gov/imap/rest/services/Elevation/MD_Bathymetry/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Environment",
			"id" : "Environment",
			"url" : "http://geodata.md.gov/imap/rest/services/Environment/",
			"children" : [{
					"name" : "MD_ChesapeakeBayDeadZones",
					"id" : "MD_ChesapeakeBayDeadZones",
					"url" : "http://geodata.md.gov/imap/rest/services/Environment/MD_ChesapeakeBayDeadZones/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_CriticalAreas",
					"id" : "MD_CriticalAreas",
					"url" : "http://geodata.md.gov/imap/rest/services/Environment/MD_CriticalAreas/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_FocalAreas",
					"id" : "MD_FocalAreas",
					"url" : "http://geodata.md.gov/imap/rest/services/Environment/MD_FocalAreas/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_ForestedBuffers",
					"id" : "MD_ForestedBuffers",
					"url" : "http://geodata.md.gov/imap/rest/services/Environment/MD_ForestedBuffers/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_PointSourceDischarges",
					"id" : "MD_PointSourceDischarges",
					"url" : "http://geodata.md.gov/imap/rest/services/Environment/MD_PointSourceDischarges/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_ProtectedLands",
					"id" : "MD_ProtectedLands",
					"url" : "http://geodata.md.gov/imap/rest/services/Environment/MD_ProtectedLands/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_ResearchReserves",
					"id" : "MD_ResearchReserves",
					"url" : "http://geodata.md.gov/imap/rest/services/Environment/MD_ResearchReserves/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_SaltMarsh",
					"id" : "MD_SaltMarsh",
					"url" : "http://geodata.md.gov/imap/rest/services/Environment/MD_SaltMarsh/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "GeocodeServices",
			"id" : "GeocodeServices",
			"url" : "http://geodata.md.gov/imap/rest/services/GeocodeServices/",
			"children" : []
		}, {
			"name" : "GeoprocessingServices",
			"id" : "GeoprocessingServices",
			"url" : "http://geodata.md.gov/imap/rest/services/GeoprocessingServices/",
			"children" : []
		}, {
			"name" : "Geoscientific",
			"id" : "Geoscientific",
			"url" : "http://geodata.md.gov/imap/rest/services/Geoscientific/",
			"children" : [{
					"name" : "MD_BaySoils",
					"id" : "MD_BaySoils",
					"url" : "http://geodata.md.gov/imap/rest/services/Geoscientific/MD_BaySoils/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Geology",
					"id" : "MD_Geology",
					"url" : "http://geodata.md.gov/imap/rest/services/Geoscientific/MD_Geology/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_LittloralDriftMaps",
					"id" : "MD_LittloralDriftMaps",
					"url" : "http://geodata.md.gov/imap/rest/services/Geoscientific/MD_LittloralDriftMaps/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_OceanEcology",
					"id" : "MD_OceanEcology",
					"url" : "http://geodata.md.gov/imap/rest/services/Geoscientific/MD_OceanEcology/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_OceanShoal",
					"id" : "MD_OceanShoal",
					"url" : "http://geodata.md.gov/imap/rest/services/Geoscientific/MD_OceanShoal/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Health",
			"id" : "Health",
			"url" : "http://geodata.md.gov/imap/rest/services/Health/",
			"children" : [{
					"name" : "MD_Hospitals",
					"id" : "MD_Hospitals",
					"url" : "http://geodata.md.gov/imap/rest/services/Health/MD_Hospitals/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_LongTermCareAssistedLiving",
					"id" : "MD_LongTermCareAssistedLiving",
					"url" : "http://geodata.md.gov/imap/rest/services/Health/MD_LongTermCareAssistedLiving/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_VitalStatistics",
					"id" : "MD_VitalStatistics",
					"url" : "http://geodata.md.gov/imap/rest/services/Health/MD_VitalStatistics/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Historic",
			"id" : "Historic",
			"url" : "http://geodata.md.gov/imap/rest/services/Historic/",
			"children" : [{
					"name" : "MD_InventoryHistoricProperties",
					"id" : "MD_InventoryHistoricProperties",
					"url" : "http://geodata.md.gov/imap/rest/services/Historic/MD_InventoryHistoricProperties/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_MHTPreservationEasements",
					"id" : "MD_MHTPreservationEasements",
					"url" : "http://geodata.md.gov/imap/rest/services/Historic/MD_MHTPreservationEasements/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_NationalRegisterHistoricPlaces",
					"id" : "MD_NationalRegisterHistoricPlaces",
					"url" : "http://geodata.md.gov/imap/rest/services/Historic/MD_NationalRegisterHistoricPlaces/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Hydrology",
			"id" : "Hydrology",
			"url" : "http://geodata.md.gov/imap/rest/services/Hydrology/",
			"children" : [{
					"name" : "MD_Floodplain",
					"id" : "MD_Floodplain",
					"url" : "http://geodata.md.gov/imap/rest/services/Hydrology/MD_Floodplain/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Gauges",
					"id" : "MD_Gauges",
					"url" : "http://geodata.md.gov/imap/rest/services/Hydrology/MD_Gauges/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_ShorelineChanges",
					"id" : "MD_ShorelineChanges",
					"url" : "http://geodata.md.gov/imap/rest/services/Hydrology/MD_ShorelineChanges/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_ShorelineInventory",
					"id" : "MD_ShorelineInventory",
					"url" : "http://geodata.md.gov/imap/rest/services/Hydrology/MD_ShorelineInventory/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Waterbodies",
					"id" : "MD_Waterbodies",
					"url" : "http://geodata.md.gov/imap/rest/services/Hydrology/MD_Waterbodies/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_WaterQuality",
					"id" : "MD_WaterQuality",
					"url" : "http://geodata.md.gov/imap/rest/services/Hydrology/MD_WaterQuality/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Watersheds",
					"id" : "MD_Watersheds",
					"url" : "http://geodata.md.gov/imap/rest/services/Hydrology/MD_Watersheds/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_WetlandMaps1972",
					"id" : "MD_WetlandMaps1972",
					"url" : "http://geodata.md.gov/imap/rest/services/Hydrology/MD_WetlandMaps1972/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Wetlands",
					"id" : "MD_Wetlands",
					"url" : "http://geodata.md.gov/imap/rest/services/Hydrology/MD_Wetlands/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Imagery",
			"id" : "Imagery",
			"url" : "http://geodata.md.gov/imap/rest/services/Imagery/",
			"children" : [{
					"name" : "MD_ImageryAcquisitionFlightInformation",
					"id" : "MD_ImageryAcquisitionFlightInformation",
					"url" : "http://geodata.md.gov/imap/rest/services/Imagery/MD_ImageryAcquisitionFlightInformation/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_NAIPImagery",
					"id" : "MD_NAIPImagery",
					"url" : "http://geodata.md.gov/imap/rest/services/Imagery/MD_NAIPImagery/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_NAIPImageryGrid",
					"id" : "MD_NAIPImageryGrid",
					"url" : "http://geodata.md.gov/imap/rest/services/Imagery/MD_NAIPImageryGrid/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_SixInchCIRImagery",
					"id" : "MD_SixInchCIRImagery",
					"url" : "http://geodata.md.gov/imap/rest/services/Imagery/MD_SixInchCIRImagery/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_SixInchImagery (Image Server)",
					"id" : "MD_SixInchImagery",
					"url" : "/imap/admin/services/Imagery/MD_SixInchImagery/ImageServer/status",
					"type" : "ImageServer"
				}, {
					"name" : "MD_SixInchImagery",
					"id" : "MD_SixInchImagery",
					"url" : "http://geodata.md.gov/imap/rest/services/Imagery/MD_SixInchImagery/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Location",
			"id" : "Location",
			"url" : "http://geodata.md.gov/imap/rest/services/Location/",
			"children" : [{
					"name" : "MD_USGSTopoGrids",
					"id" : "MD_USGSTopoGrids",
					"url" : "http://geodata.md.gov/imap/rest/services/Location/MD_USGSTopoGrids/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Military",
			"id" : "Military",
			"url" : "http://geodata.md.gov/imap/rest/services/Military/",
			"children" : []
		}, {
			"name" : "PlanningCadastre",
			"id" : "PlanningCadastre",
			"url" : "http://geodata.md.gov/imap/rest/services/PlanningCadastre/",
			"children" : [{
					"name" : "MD_FederalLands",
					"id" : "MD_FederalLands",
					"url" : "http://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_FederalLands/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_LandUseLandCover",
					"id" : "MD_LandUseLandCover",
					"url" : "http://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_LandUseLandCover/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_ParcelBoundaries",
					"id" : "MD_ParcelBoundaries",
					"url" : "http://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_PropertyData",
					"id" : "MD_PropertyData",
					"url" : "http://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "PublicSafety",
			"id" : "PublicSafety",
			"url" : "http://geodata.md.gov/imap/rest/services/PublicSafety/",
			"children" : [{
					"name" : "MD_CorrectionalFacilities",
					"id" : "MD_CorrectionalFacilities",
					"url" : "http://geodata.md.gov/imap/rest/services/PublicSafety/MD_CorrectionalFacilities/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Fire",
					"id" : "MD_Fire",
					"url" : "http://geodata.md.gov/imap/rest/services/PublicSafety/MD_Fire/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Police",
					"id" : "MD_Police",
					"url" : "http://geodata.md.gov/imap/rest/services/PublicSafety/MD_Police/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_VeryHighRiskCensusTracts",
					"id" : "MD_VeryHighRiskCensusTracts",
					"url" : "http://geodata.md.gov/imap/rest/services/PublicSafety/MD_VeryHighRiskCensusTracts/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Society",
			"id" : "Society",
			"url" : "http://geodata.md.gov/imap/rest/services/Society/",
			"children" : [{
					"name" : "MD_EducationFacilities",
					"id" : "MD_EducationFacilities",
					"url" : "http://geodata.md.gov/imap/rest/services/Society/MD_EducationFacilities/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Libraries",
					"id" : "MD_Libraries",
					"url" : "http://geodata.md.gov/imap/rest/services/Society/MD_Libraries/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_SportVenues",
					"id" : "MD_SportVenues",
					"url" : "http://geodata.md.gov/imap/rest/services/Society/MD_SportVenues/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Structure",
			"id" : "Structure",
			"url" : "http://geodata.md.gov/imap/rest/services/Structure/",
			"children" : [{
					"name" : "MD_CommunitySupport",
					"id" : "MD_CommunitySupport",
					"url" : "http://geodata.md.gov/imap/rest/services/Structure/MD_CommunitySupport/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_FederalFacilities",
					"id" : "MD_FederalFacilities",
					"url" : "http://geodata.md.gov/imap/rest/services/Structure/MD_FederalFacilities/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Transportation",
			"id" : "Transportation",
			"url" : "http://geodata.md.gov/imap/rest/services/Transportation/",
			"children" : [{
					"name" : "MD_AlternativeFuel",
					"id" : "MD_AlternativeFuel",
					"url" : "http://geodata.md.gov/imap/rest/services/Transportation/MD_AlternativeFuel/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_MVAFacilities",
					"id" : "MD_MVAFacilities",
					"url" : "http://geodata.md.gov/imap/rest/services/Transportation/MD_MVAFacilities/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_RoadCenterlines",
					"id" : "MD_RoadCenterlines",
					"url" : "http://geodata.md.gov/imap/rest/services/Transportation/MD_RoadCenterlines/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_TollPlazas",
					"id" : "MD_TollPlazas",
					"url" : "http://geodata.md.gov/imap/rest/services/Transportation/MD_TollPlazas/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_Transit",
					"id" : "MD_Transit",
					"url" : "http://geodata.md.gov/imap/rest/services/Transportation/MD_Transit/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_WelcomeandVisitorCenters",
					"id" : "MD_WelcomeandVisitorCenters",
					"url" : "http://geodata.md.gov/imap/rest/services/Transportation/MD_WelcomeandVisitorCenters/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "UtilityTelecom",
			"id" : "UtilityTelecom",
			"url" : "http://geodata.md.gov/imap/rest/services/UtilityTelecom/",
			"children" : [{
					"name" : "MD_BroadbandProviderPerCensusBlock",
					"id" : "MD_BroadbandProviderPerCensusBlock",
					"url" : "http://geodata.md.gov/imap/rest/services/UtilityTelecom/MD_BroadbandProviderPerCensusBlock/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_BroadbandServiceAreas",
					"id" : "MD_BroadbandServiceAreas",
					"url" : "http://geodata.md.gov/imap/rest/services/UtilityTelecom/MD_BroadbandServiceAreas/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_BroadbandSpeedTest",
					"id" : "MD_BroadbandSpeedTest",
					"url" : "http://geodata.md.gov/imap/rest/services/UtilityTelecom/MD_BroadbandSpeedTest/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_CommunityAnchorInstitutions",
					"id" : "MD_CommunityAnchorInstitutions",
					"url" : "http://geodata.md.gov/imap/rest/services/UtilityTelecom/MD_CommunityAnchorInstitutions/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_OffshoreWindEnergyPlanning",
					"id" : "MD_OffshoreWindEnergyPlanning",
					"url" : "http://geodata.md.gov/imap/rest/services/UtilityTelecom/MD_OffshoreWindEnergyPlanning/MapServer/",
					"type" : "MapServer"
				}
			]
		}, {
			"name" : "Weather",
			"id" : "Weather",
			"url" : "http://geodata.md.gov/imap/rest/services/Weather/",
			"children" : [{
					"name" : "MD_SeaLevelAffectingMarshesModel",
					"id" : "MD_SeaLevelAffectingMarshesModel",
					"url" : "http://geodata.md.gov/imap/rest/services/Weather/MD_SeaLevelAffectingMarshesModel/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_SeaLevelRiseVulnerability",
					"id" : "MD_SeaLevelRiseVulnerability",
					"url" : "http://geodata.md.gov/imap/rest/services/Weather/MD_SeaLevelRiseVulnerability/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_SeaLevelRiseWetlandAdaptationAreas",
					"id" : "MD_SeaLevelRiseWetlandAdaptationAreas",
					"url" : "http://geodata.md.gov/imap/rest/services/Weather/MD_SeaLevelRiseWetlandAdaptationAreas/MapServer/",
					"type" : "MapServer"
				}, {
					"name" : "MD_StormSurge",
					"id" : "MD_StormSurge",
					"url" : "http://geodata.md.gov/imap/rest/services/Weather/MD_StormSurge/MapServer/",
					"type" : "MapServer"
				}
			]
		} ]
}
