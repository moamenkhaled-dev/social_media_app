import type { IGQqlContext } from "../../../common/types/gql.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import type {
  GetProfileByIdDto,
  GraphQLGetProfileByIdDto,
} from "../profile.js";
import {
  profileService,
  type OwnerProfileResponse,
  type ProfileResponse,
} from "../profile.service.js";
import { profileValidationSchema } from "../profile.validation.js";

class ProfileResolver {
  private readonly profileService = profileService;

  //profile
  profile = async (
    parent: any,
    args: any,
    context: IGQqlContext,
  ): Promise<{ data: OwnerProfileResponse }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //service
    const { profile, stats, email, phone } = await this.profileService.profile({
      user,
    });

    return { data: { profile, stats, email, phone } };
  };

  //get profile by id
  getProfileById = async (
    parent: any,
    { targetId }: GraphQLGetProfileByIdDto,
    context: IGQqlContext,
  ): Promise<{ data: ProfileResponse }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLGetProfileByIdDto>({
      schema: profileValidationSchema.getProfileById,
      args: { targetId },
    });
    //service
    const { profile, stats, email, phone, lastSeenAt } =
      await this.profileService.getProfileById({
        user,
        targetId,
      });

    return { data: { profile, stats, email, phone, lastSeenAt } };
  };
}

export const profileResolver = new ProfileResolver();
