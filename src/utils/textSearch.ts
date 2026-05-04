const DIACRITICS_REGEX = /[\u0300-\u036f]/g;

// Mapeamento suficiente para os principais acentos usados em pt-BR.
const SQL_ACCENT_SOURCE = "áàãâäéèẽêëíìĩîïóòõôöúùũûüçñýÿ";
const SQL_ACCENT_TARGET = "aaaaaeeeeeiiiiiooooouuuuucnyy";

export function normalizeSearchTerm(value: string): string {
    return value.normalize("NFD").replace(DIACRITICS_REGEX, "").toLowerCase().trim();
}

export function unaccentedSql(column: string): string {
    return `translate(lower(coalesce(${column}, '')), '${SQL_ACCENT_SOURCE}', '${SQL_ACCENT_TARGET}')`;
}
