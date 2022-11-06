import { Add } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListSubheader,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { ComponentProps } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSources } from './adapters/sources';
import { SourceIcon } from './icon';

export function Layout({ children }: ComponentProps<'div'>) {
  const navigate = useNavigate();

  const { isLoading, isError, data } = useSources();
  const { pathname } = useLocation();

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
            selected={pathname === '/query'}
          >
            <Typography fontFamily='"Fira code", "Fira Mono", monospace'>
              Queries
            </Typography>
          </ListItemButton>
          <Divider sx={{ margin: 1 }} />
          <ListSubheader>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography
                fontFamily='"Fira code", "Fira Mono", monospace'
                sx={{ lineHeight: '40px' }}
              >
                Sources
              </Typography>
              <IconButton>
                <Add />
              </IconButton>
            </Stack>
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
                selected={pathname === `/sources/${name}`}
                sx={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <Typography fontFamily='"Fira code", "Fira Mono", monospace'>
                  {name}
                </Typography>
                <SourceIcon sourceType={data[name]['type']} />
              </ListItemButton>
            ))
          )}
        </List>
      </Drawer>
      {children}
    </Box>
  );
}
