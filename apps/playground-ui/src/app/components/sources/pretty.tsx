import { DataType } from '@arql/types';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  List,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

export function PrettyModels({
  source,
}: {
  source: {
    models: { name: string; fields: { name: string; dataType: DataType }[] }[];
  };
}) {
  return (
    <Box
      sx={{
        marginTop: '60px',
        width: '100%',
        overflow: 'auto',
      }}
    >
      {source.models.map(({ name, fields }) => {
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography
                fontFamily='"Fira code", "Fira Mono", monospace'
                sx={{
                  margin: 1,
                }}
              >
                {name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {fields.map((f) => {
                  return (
                    <ListItemText>
                      <Stack direction="row">
                        <Typography
                          fontFamily='"Fira code", "Fira Mono", monospace'
                          sx={{
                            margin: 1,
                          }}
                        >
                          {f.name}
                        </Typography>
                        <Chip
                          variant="outlined"
                          label={f.dataType}
                          sx={{
                            marginBlock: 'auto',
                            backgroundColor:
                              {
                                string: 'yellow',
                                number: '#04bd04',
                                boolean: 'grey',
                                date: 'blue',
                                json: 'none',
                              }[f.dataType] ?? 'none',
                          }}
                        />
                      </Stack>
                    </ListItemText>
                  );
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
