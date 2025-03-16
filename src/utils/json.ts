const extractJson = (raw: string): string => {
  const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);

  if (!match) throw new Error('Expected JSON but haven\'t found any matches!');

  return match[1].trim();
}

export const prettyPrintJson = ({
  data,
}: {
  data: string;
}) => {
  try {
    const cleanedData = extractJson(data);
    const parsedData = JSON.parse(cleanedData);
    const formatted = JSON.stringify(parsedData, null, 2);
        
    return formatted + '\n';
  } catch (error) {
    console.error('Failed to parse data', error instanceof Error ? error.message : String(error));
    console.log('The original data is', data);
  }
}
