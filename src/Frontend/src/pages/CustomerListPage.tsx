import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    styled,
    tableCellClasses,
  } from "@mui/material";
  import { FormEvent, useEffect, useState } from "react";
  
  interface CustomerListQuery {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
    iban: string;
    category : {
      code: string,
      description: string
    } | undefined;
  }
  
  export default function SupplierListPage() {
    const [list, setList] = useState<CustomerListQuery[]>([]);

    const [fetchData, setFetchData] = useState<boolean>(true);
    const [nameFilter, setNameFilter] = useState<string>("");
    const [emailFilter, setEmailFilter] = useState<string>("");

    const textFieldStyle = { padding: "15px"}
   
    function applyFilters(event : FormEvent<HTMLFormElement>){
      event.preventDefault();
      setFetchData(true);
    }
    function clearFilters(){
      setNameFilter("");
      setEmailFilter("");
      setFetchData(true);      
    }
    function exportXML(){
      const xmlcustomerdata = list.map((customer) => `
        <Customer>
          <Id>${customer.id}</Id>
          <Name>${customer.name}</Name>
          <Email>${customer.email}</Email>
          <Phone>${customer.phone}</Phone>
          <Iban>${customer.iban}</Iban>
          <CategoryCode>${customer.category?.code ?? '-'}</CategoryCode>
          <CategoryDescription>${customer.category?.description ?? '-'}</CategoryDescription>
        </Customer>
      `).join('')

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <Customers>
        ${xmlcustomerdata}
        </Customers>
      `;

      const blob = new Blob([xml], { type: 'application/xml' });

      // Create a download link and trigger a click on it
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'customers.xml';
      a.click();
    }    

    useEffect(() => {
      if(!fetchData)
        return;

      const filters = {
        Name : nameFilter,
        Email : emailFilter
      };
      
      fetch("/api/customers/list?" + Object.entries(filters).filter((entry) => entry[1].length != 0).map((entry) => entry[0]+"="+entry[1]).join('&'))
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setList(data as CustomerListQuery[]);
        });
        setFetchData(false);
    }, [fetchData, nameFilter, emailFilter]);
  
    return (
      <>
        <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
          Customers
        </Typography>
        <form onSubmit={applyFilters}>
          <TextField
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            label="Name Filter"
            variant="standard"
            id="name-filter"
            sx={ textFieldStyle }>
          </TextField>        
          <TextField 
            value={emailFilter}
            onChange={(event) => setEmailFilter(event.target.value)}
            label="Email Filter"
            variant="standard"
            id="email-filter"
            sx={ textFieldStyle }>
          </TextField>                  
          <Button variant="contained" type="submit">Apply</Button>
        </form>        
        <Button variant="contained" onClick={() => clearFilters()}>Clear</Button>
        <Button variant="contained" onClick={() => exportXML()}>Export XML</Button>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Name</StyledTableHeadCell>
                <StyledTableHeadCell>Address</StyledTableHeadCell>
                <StyledTableHeadCell>Email</StyledTableHeadCell>
                <StyledTableHeadCell>Phone</StyledTableHeadCell>
                <StyledTableHeadCell>Iban</StyledTableHeadCell>
                <StyledTableHeadCell>Category - Code</StyledTableHeadCell>
                <StyledTableHeadCell>Category - Description</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((row) => (
                <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.iban}</TableCell>
                <TableCell>{row.category?.code ?? "-"}</TableCell>
                <TableCell>{row.category?.description ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }
  
  const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.common.white,
    },
  }));
  