import factory from "../../layouts/base";

const layout = async (page) => {
    return factory(page, {
        text: 'MOCHA CONTEXT'
    });
};

export { layout };

export default async () => {
  return ``;
};
