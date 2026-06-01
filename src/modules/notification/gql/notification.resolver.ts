import type { IGQqlContext } from "../../../common/types/gql.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import type { NotificationListDto } from "../notification.js";
import { notificationService } from "../notification.service.js";

class NotificationResolver {
  private readonly notification = notificationService;

  //notification list
  notificationList = async (
    parent: any,
    { page, limit }: NotificationListDto,
    context: IGQqlContext,
  ): Promise<any> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //service
    const { data, meta } = await this.notification.notificationList({
      user,
      page,
      limit,
    });

    return { data, meta };
  };
}

export const notificationGQLResolver = new NotificationResolver();
