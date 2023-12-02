
import axios from 'axios'
import React, { useEffect, useState } from "react"

export default function Home() {

    const [data, setData] = useState([])
    const [pageNo, setPageNo] = useState(1)
    const [toggle, setToggle] = useState(1)
    const [editedData, setEditedData] = useState({
        name: '',
        email: '',
        role: '',
    });
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [editingRow, setEditingRow] = useState(null)
    const [pagination, setPagination] = useState(1)
    const [searchQuery, setSearchQuery] = useState('');

    async function fetchData() {
        const response = await axios.get(`https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json`)
        setData(response.data);
        maxPage = response.data.length;
    }

    useEffect(() => {
        fetchData();
    }, []);
    const handleSaveClick = () => {
        setData((prevData) =>
            prevData.map((item) => (item.id === editingRow ? { ...item, ...editedData } : item))
        );
        setEditingRow(null);
    };

    const handleInputChange = (e, field) => {
        setEditedData((prevData) => ({
            ...prevData,
            [field]: e.target.value,
        }));
    };
    const handleEditClick = (rowId, rowData) => {
        setToggle(0)
        setEditingRow(rowId);
        setEditedData({
            name: rowData.name,
            email: rowData.email,
            role: rowData.role,
        });
    };
    const handleDeleteClick = (itemId) => {
        let newData = [];
        data.map((item) => {
            if (itemId != item.id) {
                newData.push(item);
            }
        }
        )
        setData(newData);
        setPagination(7)
    }

    const filteredData = data.filter(
        (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const handleCheckboxChange = (itemId) => {
        setSelectedItems((prevSelectedItems) => {
            const newSelectedItems = new Set(prevSelectedItems);

            if (newSelectedItems.has(itemId)) {
                newSelectedItems.delete(itemId);
            } else {
                newSelectedItems.add(itemId);
            }

            return newSelectedItems;
        });
    };

    const renderHeading = () => {
        return (
            <div style={{ textAlign: "center", fontSize: 40 }}>
                Admin DashBoard
            </div>
        )
    }

    const renderTableBody = () => {
        const startIndex = (pageNo - 1) * 10;
        const endIndex = pageNo * 10;

        return (
            <table style={{ borderSpacing: 0, backgroundColor: "white", width: "100%", border: "1px solid black" }}>
                <thead>
                    <tr style={{ width: '200px', height: '50px', backgroundColor: "gray", fontWeight: 'bold' }}>
                        <td width="5%"><input type="checkbox" onChange={handleSelectAllClick} checked="" /></td>
                        <td width="5%">Id</td>
                        <td width="20%">Name</td>
                        <td width="30%">Email</td>
                        <td width="20%">Role</td>
                        <td width="20%" colspan="2">Action</td>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.slice(startIndex, endIndex).map((item) => {
                        const isEditing = editingRow === item.id;
                        const rowStyle = { width: '200px', height: '30px', backgroundColor: isEditing ? '#7F7D9C' : item.id % 2 !== 0 ? 'lightgray' : '#FDF4DC' }

                        return (
                            <tr key={item.id} style={rowStyle}>
                                <td width="5%">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => handleCheckboxChange(item.id)}
                                    />
                                </td>
                                <td width="5%">{item.id}</td>
                                <td width="20%">{isEditing ? <input type="text" value={editedData.name} onChange={(e) => handleInputChange(e, 'name')} /> : item.name}</td>
                                <td width="30%">{isEditing ? <input type="text" value={editedData.email} onChange={(e) => handleInputChange(e, 'email')} /> : item.email}</td>
                                <td width="20%">{isEditing ? <input type="text" value={editedData.role} onChange={(e) => handleInputChange(e, 'role')} /> : item.role}</td>
                                <td width="10%">
                                    {isEditing ? (
                                        <div>
                                            <button onClick={handleSaveClick}>Save</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEditClick(item.id, item)}>Edit</button>
                                    )}
                                </td>
                                <td width="10%"><button  onClick={() => handleDeleteClick(item.id)}>Delete</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        );
    };
    const renderPagination = () => {
        return (
            pagination &&
            <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: "gray", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => { setPageNo(1) }}> &#60;&#60; </button>
                <button onClick={() => { pageNo > 1 && setPageNo(pageNo - 1) }}>&#60;</button>
                <div>{pageNo}</div>
                <button onClick={() => { pageNo < Math.ceil(data.length / 10) && setPageNo(pageNo + 1) }}>&#62;</button>
                <button onClick={() => { setPageNo(Math.ceil(data.length / 10)) }}>&#62;&#62;</button>
            </div>
        )
    }
    const renderSearchBar = () => {
        return (
            <div style={{ display: "flex", justifyContent: "center", textAlign: 'center', marginBottom: "20px", marginTop: "10px" }}>
                <input
                    size="35"
                    type="text" placeholder="Search by name, email, or role"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPageNo(1);
                    }}
                />
            </div>
        )
    }
    const renderDeleteAllSelected = () => {
        const btnstyle = { float: "right", textAlign: "center", padding: "5px", marginTop: "5px", marginBottom: "20px" }
        return (

            <button style={btnstyle}
                onClick={() => {
                    const filteredData = data.filter((item) => !selectedItems.has(item.id));
                    setData(filteredData);
                }}>
                Delete All Selected
            </button>
        )
    }
    const handleSelectAllClick = () => {
        const startIndex = (pageNo - 1) * 10;
        const endIndex = pageNo * 10;

        const currentPageItems = data.slice(startIndex, endIndex);
        const currentPageItemIds = currentPageItems.map((item) => item.id);

        setSelectedItems((prevSelectedItems) => {
            const newSelectedItems = new Set(prevSelectedItems);

            // Add or remove IDs based on whether all checkboxes are currently selected
            if (currentPageItemIds.every((id) => prevSelectedItems.has(id))) {
                // If all are selected, unselect all
                currentPageItemIds.forEach((id) => newSelectedItems.delete(id));
            } else {
                // If not all are selected, select all
                currentPageItemIds.forEach((id) => newSelectedItems.add(id));
            }

            return newSelectedItems;
        });
    };


    return (
        <div>
            {renderHeading()}
            {renderSearchBar()}
            {renderTableBody()}
            {renderPagination()}
            {renderDeleteAllSelected()}
        </div>
    )
}