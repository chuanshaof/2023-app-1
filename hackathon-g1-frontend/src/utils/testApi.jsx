import { client } from "./api";

export const getTest = async () => {
    const { data } = await client.get('');
    return data;
}
