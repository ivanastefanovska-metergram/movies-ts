const {
    PORT,
} = process.env;

export const config = {
    PORT: parseInt(PORT!) || 3001,
};
