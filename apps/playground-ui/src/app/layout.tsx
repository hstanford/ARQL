import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  Skeleton,
} from '@mui/material';
import { ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSources } from './adapters/sources';

export function Layout({ children }: ComponentProps<'div'>) {
  const navigate = useNavigate();

  const { isLoading, isError, data } = useSources();

  return (
    <Box sx={{ display: 'flex' }}>
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
            sx={{ marginBottom: 1 }}
            onClick={() => {
              navigate('/query');
            }}
          >
            Run query
          </ListItemButton>
          <Divider />
          {isError || isLoading ? (
            <Box>
              <Skeleton
                variant="rectangular"
                height="40px"
                sx={{ marginBlock: 1 }}
              />
              <Skeleton
                variant="rectangular"
                height="40px"
                sx={{ marginBlock: 1 }}
              />
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
                sx={{ marginBlock: 1 }}
                onClick={() => navigate(`/sources/${name}`)}
              >
                {name}
              </ListItemButton>
            ))
          )}
        </List>
      </Drawer>
      {children}
    </Box>
  );
}
