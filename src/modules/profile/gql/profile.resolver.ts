import type { IStats } from "../../../common/interfaces/stats.interfaces.js";
import type { IGQqlContext } from "../../../common/types/gql.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import type {
  GetProfileByIdDto,
  GetStatsDto,
  GraphQLGetProfileByIdDto,
} from "../profile.js";
import { profileService } from "../profile.service.js";
import { profileValidationSchema } from "../profile.validation.js";

class ProfileResolver {
  private readonly profileValidation = profileValidationSchema;
  private readonly profileService = profileService;

  //profile
  profile = async (
    parent: any,
    args: any,
    context: IGQqlContext,
  ): Promise<{ data: any }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //service
    const { profile, stats } = await this.profileService.profile({
      user,
    });

    return { data: { profile, stats } };
  };

  //get profile by id
  getProfileById = async (
    parent: any,
    { targetId }: GraphQLGetProfileByIdDto,
    context: IGQqlContext,
  ): Promise<{ data: any }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLGetProfileByIdDto>({
      schema: this.profileValidation.getProfileById,
      args: { targetId },
    });
    //service
    const { profile, stats } = await this.profileService.getProfileById({
      user,
      targetId,
    });

    return { data: { profile, stats } };
  };

  //get stats
  getStats = async (
    parent: any,
    { targetId }: GetStatsDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: IStats }> => {
    //authentication
    await GQLAuthentication({ context });
    //validation
    const verifiedData = await GQLValidate<GetStatsDto>({
      schema: this.profileValidation.getStats,
      args: { targetId },
    });
    //service
    const stats = await this.profileService.getStats({ ...verifiedData });

    return { message: "Success", data: stats };
  };
}

export const profileResolver = new ProfileResolver();
