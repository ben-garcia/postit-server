import { GraphQLResponse } from 'apollo-server-plugin-base';

const formatResponse = (response: GraphQLResponse) => {
  if (response?.errors) {
    const modifiedResponse: { errors: { [k: string]: string }[] } = {
      errors: [],
    };

    if (response.errors[0]?.message.startsWith('Argument')) {
      response.errors[0].extensions?.exception.validationErrors.forEach(
        (e: any) => {
          modifiedResponse.errors.push({
            field: e.property,
            constraints: e.constraints,
          });
        }
      );
    }
    return modifiedResponse;
  }
  return response;
};

export default formatResponse;
