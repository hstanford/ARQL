import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListSubheader,
  Skeleton,
  Typography,
} from '@mui/material';
import { ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSources } from './adapters/sources';

export function Layout({ children }: ComponentProps<'div'>) {
  const navigate = useNavigate();

  const { isLoading, isError, data } = useSources();

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Drawer
        anchor="left"
        variant="permanent"
        sx={{ minWidth: '200px', display: 'flex' }}
      >
        <Box sx={{ padding: 2 }}>
          <Button onClick={() => navigate('/')}>ARQL Playground</Button>
        </Box>
        <List sx={{ minWidth: '200px' }}>
          <ListItemButton
            sx={{
              marginBottom: 1,
            }}
            onClick={() => {
              navigate('/query');
            }}
          >
            <Typography fontFamily='"Fira code", "Fira Mono", monospace'>
              Queries
            </Typography>
          </ListItemButton>
          <Divider sx={{ margin: 1 }} />
          <ListSubheader>
            <Typography fontFamily='"Fira code", "Fira Mono", monospace'>
              Sources
            </Typography>
          </ListSubheader>
          {isError || isLoading ? (
            <Box>
              <Skeleton
                variant="rectangular"
                height="40px"
                sx={{ marginBlock: 1 }}
              />
            </Box>
          ) : (
            Object.keys(data).map((name: string, idx: number) => (
              <ListItemButton
                key={idx}
                onClick={() => navigate(`/sources/${name}`)}
              >
                <Typography fontFamily='"Fira code", "Fira Mono", monospace'>
                  {name}
                </Typography>
              </ListItemButton>
            ))
          )}
        </List>
      </Drawer>
      {children}
    </Box>
  );
}
