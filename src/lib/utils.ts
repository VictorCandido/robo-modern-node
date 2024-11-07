export function parseStringCurrencyToNumber(value: string): number {
    if (!value) return 0;
    return Number(value.replace('R$', '').replace(/\./g, '').replace(',', '.'));
}

export function parseRedutorToNumber(value: string): number {
    if (!value) return 0;
    return Number(value.replace(',', '.'));
}

export function convertToTimestamp(dateString: string): number {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);

    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    return date.getTime();
}