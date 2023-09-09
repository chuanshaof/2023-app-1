import { useState, useEffect } from 'react';
// @mui
import { Box, Grid, Container, Typography, Stack, TextField, Button } from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';



import axios from 'axios'
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
// sections
import {
  AnalyticsTasks,
  AnalyticsNewsUpdate,
  AnalyticsOrderTimeline,
  AnalyticsCurrentVisits,
  AnalyticsWebsiteVisits,
  AnalyticsTrafficBySite,
  AnalyticsWidgetSummary,
  AnalyticsCurrentSubject,
  AnalyticsConversionRates,
  Query1,
  Query2,
  Query3,
  Query4,
  Query5
} from '../../sections/@dashboard/general/analytics';


// ----------------------------------------------------------------------


export default function GeneralAnalytics() {
  const { themeStretch } = useSettings();
  const [data, setData] = useState("Hello");
  const [fundId, setFundId] = useState(1);
  const [instrumentId, setInstrumentId] = useState(-1);
  const [country, setCountry] = useState("");
  const [sector, setSector] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleFundChange = (e) =>{
    setFundId(e.target.value)
  }

  const handleInstrumentChange = (e) =>{
    setInstrumentId(e.target.value)
  }
  const handleCountryChange = (e) =>{
    setCountry(e.target.value)
  }
  const handleSectorChange = (e) =>{
    setSector(e.target.value)
  }


  const handleQuery = () =>{
      console.log({
        "fundId" : fundId,
        "instrumentId" : instrumentId,
        "country" : country,
        "sector" : sector,
        "startDate" : startDate.toISOString(),
        "endDate" : endDate.toISOString()
      })
  }

  // useEffect(() => {
  //   axios.get("http://ec2-54-169-209-187.ap-southeast-1.compute.amazonaws.com/routers").then(res => {
  //     setData(res.data.Hello)
  //   });
  // });

  return (
    <Page title="General: Analytics" >
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack>
        <Query1 />
        <Query2 />
        <Query3 />
        <Query4 />
        <Query5 />

        </Stack>
        {/* <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary title="New Users" total={1352831} color="info" icon={'ant-design:apple-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Item Orders"
              total={1723315}
              color="warning"
              icon={'ant-design:windows-filled'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary title="Bug Reports" total={234} color="error" icon={'ant-design:bug-filled'} />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AnalyticsWebsiteVisits />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AnalyticsCurrentVisits />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AnalyticsConversionRates />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AnalyticsCurrentSubject />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AnalyticsNewsUpdate />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AnalyticsOrderTimeline />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AnalyticsTrafficBySite />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AnalyticsTasks />
          </Grid>
        </Grid> */}
      </Container>
      {/* <iframe
        width={"100%"}
        height={"1000px"}
        title="dashboard"
        src="https://ap-southeast-1.quicksight.aws.amazon.com/sn/embed/share/accounts/265971165621/dashboards/cde89cd2-8731-4e36-800e-c071074852eb?directory_alias=gic-team01" /> */}
    </Page>
  );
}
