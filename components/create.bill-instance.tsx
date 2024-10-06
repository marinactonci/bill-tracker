import React, { useState } from "react";
import { Modal, Button, DatePicker, InputNumber, Switch, Select } from "antd";
import { notification } from "antd";
import { createBillInstance } from "@/utils/supabaseUtils";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CreateProfileProps {
  bills: { id: number; name: string }[];
  onChange: () => void;
}

function CreateBillInstance({ bills, onChange }: CreateProfileProps) {
  const [billId, setBillId] = useState(1);
  const [month, setMonth] = useState(dayjs(dayjs().subtract(1, "month")));
  const [dueDate, setDueDate] = useState(dayjs());
  const [amount, setAmount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [api, contextHolder] = notification.useNotification();

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await createBillInstance(billId, month.toDate(), dueDate.toDate(), amount, isPaid);
      api.success({
        message: "Bill instance created",
        description: "The bill instance has been created successfully",
      });
      setOpen(false);
      onChange();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Button
        type="primary"
        className="bg-blue-500"
        onClick={() => setOpen(true)}
      >
        Add instance
      </Button>
      <Modal
        title={"Add a bill instance"}
        centered
        open={open}
        destroyOnClose
        footer={null}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col w-full">
            <span className="text-gray-700">Month</span>
            <DatePicker
              format={"MM.YYYY."}
              picker="month"
              showNow
              defaultValue={month}
              onChange={(value) => {
                if (!value) return;
                setMonth(value);
              }}
            />
          </label>
          <label className="flex flex-col w-full">
            <span className="text-gray-700">Amount</span>
            <InputNumber
              className="w-full"
              min={0}
              defaultValue={amount}
              formatter={(value) =>
                `${value} €`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => {
                if (value !== null) setAmount(value);
              }}
            />
          </label>
          <label className="flex flex-col w-full">
            <span className="text-gray-700">Due date</span>
            <DatePicker
              format={"DD.MM.YYYY."}
              showNow
              defaultValue={dayjs()}
              onChange={(value) => {
                if (!value) return;
                setDueDate(value.hour(12).minute(0).second(0));
              }}
            />
          </label>
          <label className="flex flex-col w-full">
            <span className="text-gray-700">Instance for bill</span>
            <Select
              placeholder="Select a bill"
              onChange={(value) => setBillId(value)}
              options={bills.map((bill) => ({
                value: bill.id,
                label: bill.name,
              }))}
            />
          </label>
          <div className="flex items-center gap-3">
            <Switch
              checked={isPaid}
              onChange={(checked: boolean) => setIsPaid(checked)}
            />
            <span className="label-text">
              Status: {isPaid ? "Paid" : "Unpaid"}
            </span>
          </div>
        </form>
        <div className="flex items-center justify-end mt-8">
          <div className="flex gap-3">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => handleCreate()}>
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CreateBillInstance;
