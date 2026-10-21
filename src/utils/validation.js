const validationFailAction = (request, h, error) => {
    throw error;
};

module.exports = {
    validationFailAction,
};