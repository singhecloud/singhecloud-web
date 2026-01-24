import { useEffect, useState } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Box, TextField, Button } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type BlockedIp = { id: number; ip: string; note?: string };

export default function BlockedIpsPage() {
  const [rows, setRows] = useState<BlockedIp[]>([]);
  const [ip, setIp] = useState('');
  const [note, setNote] = useState('');

  const fetchIps = async () => {
    const { data } = await axios.get('/blocked-ips');
    setRows(data);
  };

  useEffect(() => { fetchIps(); }, []);

  const addIp = async () => {
    if (!ip) return;
    await axios.post('/blocked-ips', { ip, note });
    setIp(''); setNote('');
    fetchIps();
  };

  const deleteIp = async (id: number) => {
    await axios.delete(`/blocked-ips/${id}`);
    fetchIps();
  };

  const columns: GridColDef[] = [
    { field: 'ip', headerName: 'IP', width: 200 },
    { field: 'note', headerName: 'Note', width: 300 },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <Button color="error" onClick={() => deleteIp(params.row.id)}>Delete</Button>
      )
    }
  ];

  return (
    <AppLayout>
      <Head title="Blocked IPs" />
      <Box className="flex flex-col gap-4 p-4">
        <Box display="flex" gap={2}>
          <TextField label="IP" size="small" value={ip} onChange={e => setIp(e.target.value)} />
          <TextField label="Note" size="small" value={note} onChange={e => setNote(e.target.value)} />
          <Button variant="contained" onClick={addIp}>Add</Button>
        </Box>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          getRowId={(row) => row.id}
        />
      </Box>
    </AppLayout>
  );
}
