import 'server-only'

import {
  ListEnum,
  ProfileEnum,
  ProfileSubscriptionBulkCreateJobEnum,
} from 'klaviyo-api'

import { profilesClient } from './client/profiles'

interface SubscribeProfileToListProps {
  listId: string
  email?: string
  phoneNumber?: string
}

export const subscribeProfileToList = async ({
  listId,
  email,
  phoneNumber,
}: SubscribeProfileToListProps) =>
  profilesClient
    .subscribeProfiles({
      data: {
        type: ProfileSubscriptionBulkCreateJobEnum.ProfileSubscriptionBulkCreateJob,
        attributes: {
          profiles: {
            data: [
              {
                type: ProfileEnum.Profile,
                attributes: {
                  email,
                  phoneNumber,
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: 'SUBSCRIBED',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        relationships: {
          list: {
            data: {
              type: ListEnum.List,
              id: listId,
            },
          },
        },
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((err: any) => {
      console.error(err.response.data)
    })
