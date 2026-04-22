export function parseOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

export function parseOptionalBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true" || normalized === "1") {
            return true;
        }
        if (normalized === "false" || normalized === "0") {
            return false;
        }
    }

    return undefined;
}

export function parseOptionalDate(value: unknown, options?: { endOfDay?: boolean }): Date | undefined {
    if (typeof value !== "string" || value.trim().length === 0) {
        return undefined;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }

    if (options?.endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        parsed.setHours(23, 59, 59, 999);
    }

    return parsed;
}
