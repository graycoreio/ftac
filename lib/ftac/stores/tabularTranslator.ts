/** The Copy translator every portal-built Copy carries. */
export const tabularTranslator = () => ({
    type: 'TabularTranslator',
    typeConversion: true,
    typeConversionSettings: { allowDataTruncation: true, treatBooleanAsNumber: false },
});
