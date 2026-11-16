
import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/post-confirmation';
import type { Schema } from '../../data/resource';

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { resourceConfig, libraryOptions } =
    await getAmplifyDataClientConfig(env);

  Amplify.configure(resourceConfig, libraryOptions);

  const client = generateClient<Schema>({
    authMode: 'iam',
  });

  const { errors } = await client.models.UserProfile.create({
    email: event.request.userAttributes.email,
    profileOwner: `${event.request.userAttributes.sub}::${event.userName}`,
  });

  if (errors?.length) {
    throw new Error(
      `Failed to create user profile: ${JSON.stringify(errors)}`
    );
  }

  return event;
};
