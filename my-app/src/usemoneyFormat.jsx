export const moneyformat = (value, curencymode = 'USD', locale = 'en-US') => {
    if (isNaN(value)) return 'Free';
    const clearCurrency = String(curencymode).toUpperCase().trim();
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: clearCurrency,
        }).format(value).replace('$',"ETB ");
    } catch (error) {
        console.error('Formatting error', error);
        return `${clearCurrency} ${Number(value).toFixed(2)}`;
    }
}