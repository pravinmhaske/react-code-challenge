import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'antd';
import AddEditTransaction from './AddEditTransaction';
import useFetch from './../hooks/useFetch';
import uuid from 'react-uuid'
import ENDPOINTS, { HEADER_OPTIONS } from "./../config/constants";
import Loader from './Loader'

import { Table, Popconfirm, Form, Typography } from 'antd';

function TransactionList() {

    const [form] = Form.useForm();
    const [data, setData] = useState();
    const [editingKey, setEditingKey] = useState('');

    let { response, error, isLoading } = useFetch(ENDPOINTS.getTransaction, "GET", HEADER_OPTIONS);

    if (!data && response) {
        console.log("response ", response);

        const array = response.sort((a, b) => (a.sales_reference - b.sales_reference))
        let res = new Array();
        for (let i = 0; i < array.length; i++) {
            if ((array.length - 1) === i || (array[i + 1].sales_reference - array[i].sales_reference) == 1) {
                res.push({ ...array[i], key: uuid() })
            } else {
                let latesReference = array[i].sales_reference
                for (let j = 0; j < (array[i + 1].sales_reference - array[i].sales_reference); j++) {
                    res.push({ sales_reference: latesReference, amount: '', created_at: '', key: uuid() });
                    latesReference = latesReference + 1;
                }

            }
        }
        setData(res)
    }

    const columns = [
        {
            title: 'Amount',
            dataIndex: 'amount',
            width: '25%',
            editable: true,
        },
        {
            title: 'Sales Reference',
            dataIndex: 'sales_reference',
            width: '15%',
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            width: '40%',
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Button
                            type="primary"
                            onClick={() => save(record.key)}
                            style={{
                                marginRight: 8,
                            }}
                        >
                            Save
                        </Button>
                        <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                            <Button> Cancel</Button>
                        </Popconfirm>
                    </span>
                ) : (
                        <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                            {record.amount ? "Edit" : "Add"}
                        </Typography.Link>
                    );
            },
        },
    ];
    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => {
        form.setFieldsValue({
            name: '',
            age: '',
            address: '',
            ...record,
        });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);

            if (index > -1) {
                const item = newData[index];
                item.created_at = (new Date()).toLocaleString();
                newData.splice(index, 1, { ...item, ...row });
                setData(newData);
                setEditingKey('');
                // add api call here to update a record
            } else {
                // add api call here to save new record
                row.created_at = (new Date()).toLocaleString();
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    // const columns = 

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });
    return (
        <div>{
            isLoading ? <Loader /> :
                <Form form={form} component={false}>
                    <Table
                        components={{
                            body: {
                                cell: AddEditTransaction,
                            },
                        }}
                        bordered
                        dataSource={data}
                        columns={mergedColumns}
                        rowClassName="editable-row"
                        pagination={{
                            onChange: cancel,
                        }}
                    />
                </Form>
        }

        </div>
    )
}

export default TransactionList
