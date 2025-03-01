export const PASSWORD_MAP: Record<string, string> = JSON.parse(process.env.PASSWORD_MAP as string);
export const SCORE_MAP: Record<string, number> = JSON.parse(process.env.SCORE_MAP as string);

export const verify_and_get_name = function(passowrd: string): string | null {
    for (const key in PASSWORD_MAP) {
        if (key == passowrd) {
            return PASSWORD_MAP[key];
        }
    }
    return null;
}

export const get_score = function(cdk_type: string): number {
    for (const tag in SCORE_MAP) {
        if (tag == cdk_type) {
            return parseInt(SCORE_MAP[tag] + "");
        }
    }
    return 1;
}