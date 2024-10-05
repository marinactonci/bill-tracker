import React, { useState, useEffect } from "react";
import { Modal, AutoComplete, Input } from "antd";
import { countries } from "../utils/countries";
import {
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { updateProfile, deleteProfile } from "@/utils/supabaseUtils";
import { notification } from "antd";
import { ProfileType } from "@/types/profile";

interface ProfileProps {
  profile: ProfileType;
  onChange: () => void;
}

function Profile({ profile, onChange }: ProfileProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    setName(profile.name);
    setStreet(profile.street);
    setCity(profile.city);
    setCountry(profile.country);
  }, [profile]);

  const handleSave = async () => {
    if (!name || !street || !city || !country) {
      setError("No fields can be empty.");
      return;
    }

    try {
      await updateProfile(profile.id, name, street, city, country);
      setOpen(false);
      api.success({
        message: "Profile updated",
        description: "Profile has been updated successfully.",
      });
      onChange();
    } catch (error) {
      api.error({
        message: "Error updating profile",
        description: "An error occurred while updating the profile.",
      });
      console.error("Error updating profile:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProfile(profile.id);
      onChange();
      api.success({
        message: "Profile deleted",
        description: "Profile has been deleted successfully.",
      });
    } catch (error) {
      api.error({
        message: "Error deleting profile",
        description: "An error occurred while deleting the profile.",
      });
      console.error("Error deleting profile:", error);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      {contextHolder}
      <div className="flex flex-col p-6 gap-3 border rounded-lg">
        <div className="flex flex-col gap-6 justify-between">
          <div className="flex items-center gap-2">
            <HomeOutlined className="text-2xl" />
            <h1 className="text-2xl font-bold">{profile.name}</h1>
          </div>
          <div className="flex gap-2 items-center text-lg">
            <PushpinOutlined />
            <p className=" text-zinc-500">
              {profile.street}, {profile.city},{" "}
              {countries.map((countryItem) => {
                if (countryItem.code === profile.country) {
                  return countryItem.name;
                }
              })}
            </p>
          </div>
          <div className="flex justify-end items-center gap-2">
            <Button
              className="flex items-center gap-2"
              onClick={() => setOpen(true)}
            >
              <EditOutlined />
              <span>Edit</span>
            </Button>
            <Button
              className="flex items-center gap-2"
              color="danger"
              variant="solid"
              onClick={() => handleDelete()}
            >
              <DeleteOutlined />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>
      <Modal
        title={"Edit " + profile.name}
        centered
        open={open}
        destroyOnClose
        keyboard
        okText="Create"
        cancelText="Cancel"
        footer={null}
        onOk={() => setOpen(false)}
        onCancel={() => handleCancel()}
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex flex-col w-full">
            <span className="text-gray-700">Name</span>
            <Input
              type="text"
              placeholder="Entert profile name"
              defaultValue={profile.name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </label>
          <label className="text-gray-900 mt-3 text-lg">Address</label>
          <label className="flex flex-col w-full">
            <span className="text-gray-700">Street</span>
            <Input
              type="text"
              placeholder="Eg. 123 Main St."
              defaultValue={profile.street}
              onChange={(e) => {
                setStreet(e.target.value);
              }}
            />
          </label>
          <label className="flex flex-col w-full">
            <span className="text-gray-700">City</span>
            <Input
              type="text"
              placeholder="Eg. New York"
              defaultValue={profile.city}
              onChange={(e) => {
                setCity(e.target.value);
              }}
            />
          </label>
          <label className="flex flex-col w-full">
            <span className="text-gray-700">Country</span>
            <AutoComplete
              allowClear
              defaultValue={profile.country}
              options={countries.map((country) => {
                return {
                  value: country.name,
                  name: country.name,
                  label: country.name,
                };
              })}
              onChange={(value) => {
                countries.forEach((countryItem) => {
                  if (countryItem.name === value) {
                    setCountry(countryItem.name);
                  }
                });
              }}
              filterOption={(inputValue, option) => {
                if (option?.value === undefined) return false;
                return (
                  option?.name
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                );
              }}
              placeholder="Eg. United States"
            />
          </label>
          {error && (
            <div className="text-red-500 text-sm font-semibold">{error}</div>
          )}
        </form>
        <div className="modal-action">
          <button
            className="p-2 border bg-white border-black rounded-md font-semibold text-sm hover:bg-gray-50 transition-colors uppercase"
            onClick={() => {
              setOpen(false);
              setError(null);
            }}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="p-2 bg-black min-w-[70px] border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-gray-900 active:bg-gray-700 focus:outline-none focus:border-gray-700 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading && (
              <span className="loading loading-spinner loading-md"></span>
            )}
            {!isLoading && "Update"}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default Profile;
