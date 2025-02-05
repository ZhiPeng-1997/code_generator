export const PASSWORD_MAP: Record<string, string> = JSON.parse(process.env.PASSWORD_MAP as string);

export const verify_and_get_name = function(passowrd: string): string | null {
    for (const key in PASSWORD_MAP) {
        if (key == passowrd) {
            return PASSWORD_MAP[key];
        }
    }
    return null;
}