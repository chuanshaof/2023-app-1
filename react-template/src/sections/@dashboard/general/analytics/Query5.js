import { useState, useEffect } from 'react';
// @mui
import { Box, Grid, Container, Typography, Stack, TextField, Button } from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Select, { SelectChangeEvent } from '@mui/material/Select';



import axios from 'axios'
// hooks
import useSettings from '../../../../hooks/useSettings';
// sections

import BarChart from './BarChart';



// ---------------------------------------------------------------------


export default function Query5() {
    const { themeStretch } = useSettings();
    const [data, setData] = useState(null);
    const [nvalues, setNvalues] = useState(null);

    const handleNvaluesChange = (e) => {
        setNvalues(e.target.value)
    }

    
    const handleQuery = async () => {
        const query = {
            "n": nvalues,
            "months" : 12,
            "date" : "2023-09-09"
        }
        sessionStorage.setItem("query5", query);
        await axios.post(`${process?.env.REACT_APP_BACKEND_URL}/analytics/top_n`, query).then(
            res => {
                setData(res.data)
                console.log(res.data)}

        )
        
    }

    // useEffect(() => {
    //   axios.get("http://ec2-54-169-209-187.ap-southeast-1.compute.amazonaws.com/routers").then(res => {
    //     setData(res.data.Hello)
    //   });
    // });

    return (
        <Box>
            <Box sx={{ minWidth: 120 }}>
                <Stack direction="row" justifyContent={"space-between"} spacing={2} sx={{ p: 4 }}>



                    <TextField
                        id="outlined-required"
                        label="Top N Funds"
                        value={nvalues}
                        onChange={handleNvaluesChange}
                    />



                    <Button onClick={handleQuery}> Visualise </Button>
                </Stack>
            </Box>
            <Container maxWidth={themeStretch ? false : 'xl'}>
                {data && <BarChart data={data} title={"Top N Performing Funds"}/>}
            </Container>
        </Box>
    );
}
