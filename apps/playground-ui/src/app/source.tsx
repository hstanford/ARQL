import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';

export function Source() {
  const params = useParams();
  console.log(params);
  return <Box>{params['name']}</Box>;
}
