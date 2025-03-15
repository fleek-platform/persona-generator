export const prettyPrintJson = ({
  data,
}: {
  data: string;
}) => {
  try {
    const parsedData = JSON.parse(data);    
    const formatted = JSON.stringify(parsedData, null, 2);
        
    return formatted + '\n';
  } catch (error) {
    console.error('Failed to parse data', error instanceof Error ? error.message : String(error));
    console.log('Original data:', data);
  }
}
