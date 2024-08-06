import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardDescription ,CardTitle } from "@/components/ui/card";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [newClient, setNewClient] = useState({
    name: "",
    clientName: "",
    companyName: "",
    phoneNumber: "",
    location: "",
  });
  const [errors, setErrors] = useState({
    name: "",
  });

  const fetchClients = async () => {
    const { data, error } = await supabase.from("clients").select("*");
    if (error) {
      console.error("Error fetching clients:", error);
    } else {
      setClients(data);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const validateClient = () => {
    let isValid = true;
    const newErrors = { name: "" };

    if (!newClient.name) {
      newErrors.name = "Client name is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const addClient = async () => {
    if (validateClient()) {
      const { error } = await supabase.from("clients").insert([
        {
          name: newClient.name,
          client_name: newClient.clientName,
          company_name: newClient.companyName,
          phone_number: newClient.phoneNumber,
          location: newClient.location,
        },
      ]);
      if (error) {
        console.error("Error adding client:", error);
      } else {
        fetchClients();
        setIsDialogOpen(false);
        setNewClient({
          name: "",
          clientName: "",
          companyName: "",
          phoneNumber: "",
          location: "",
        });
      }
    }
  };

  const deleteClient = async (id) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      console.error("Error deleting client:", error);
    } else {
      fetchClients();
    }
  };

  return (
    <div>
      {/* <h2 className="text-2xl font-bold mb-4">Clients</h2> */}
      <Card className="bg-gray-50">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>A list of all clients.</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>Add Client</Button>
        </CardHeader>
        <CardContent className="h-[480px] overflow-hidden">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <div className="overflow-y-auto max-h-[452px]">
              <table className="w-full divide-y-2 divide-gray-200 bg-white text-sm">
                <thead className="bg-white sticky top-0 z-10">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                      Name
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                      Client Name
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                      Company Name
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                      Phone Number
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                      Location
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-100 transition-colors duration-200"
                    >
                      <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        {client.name}
                      </td>
                      <td className="whitespace-nowrap text-center px-4 py-2 text-gray-700">
                        {client.client_name}
                      </td>
                      <td className="whitespace-nowrap text-center px-4 py-2 text-gray-700">
                        {client.company_name}
                      </td>
                      <td className="whitespace-nowrap text-center px-4 py-2 text-gray-700">
                        {client.phone_number}
                      </td>
                      <td className="whitespace-nowrap text-center px-4 py-2 text-gray-700">
                        {client.location}
                      </td>
                      <td className="whitespace-nowrap text-center px-4 py-2 text-gray-700">
                        <div className="space-x-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCurrentClient(client);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  setCurrentClient(client);
                                }}
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently
                                  delete this client.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setCurrentClient(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    if (currentClient) {
                                      deleteClient(currentClient.id);
                                      setCurrentClient(null);
                                    }
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Client Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="name" className="mt-2">Name</Label>
            <Input
              type="text"
              id="name"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
            />
            {errors.name && <p className="text-red-600">{errors.name}</p>}

            <Label htmlFor="clientName" className="mt-2">Client Name</Label>
            <Input
              type="text"
              id="clientName"
              value={newClient.clientName}
              onChange={(e) =>
                setNewClient({ ...newClient, clientName: e.target.value })
              }
            />

            <Label htmlFor="companyName" className="mt-2">Company Name</Label>
            <Input
              type="text"
              id="companyName"
              value={newClient.companyName}
              onChange={(e) =>
                setNewClient({ ...newClient, companyName: e.target.value })
              }
            />

<Label htmlFor="phoneNumber" className="mt-2">Phone Number</Label>
            <Input
              type="text"
              id="phoneNumber"
              value={newClient.phoneNumber}
              onChange={(e) =>
                setNewClient({ ...newClient, phoneNumber: e.target.value })
              }
            />

            <Label htmlFor="location" className="mt-2">Location</Label>
            <Input
              type="text"
              id="location"
              value={newClient.location}
              onChange={(e) =>
                setNewClient({ ...newClient, location: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button onClick={addClient}>Add Client</Button>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="name" className="mt-2">Name</Label>
            <Input
              type="text"
              id="name"
              value={currentClient?.name || ""}
              onChange={(e) =>
                setCurrentClient({ ...currentClient, name: e.target.value })
              }
            />

            <Label htmlFor="clientName" className="mt-2">Client Name</Label>
            <Input
              type="text"
              id="clientName"
              value={currentClient?.client_name || ""}
              onChange={(e) =>
                setCurrentClient({ ...currentClient, client_name: e.target.value })
              }
            />

            <Label htmlFor="companyName" className="mt-2">Company Name</Label>
            <Input
              type="text"
              id="companyName"
              value={currentClient?.company_name || ""}
              onChange={(e) =>
                setCurrentClient({ ...currentClient, company_name: e.target.value })
              }
            />

            <Label htmlFor="phoneNumber" className="mt-2">Phone Number</Label>
            <Input
              type="text"
              id="phoneNumber"
              value={currentClient?.phone_number || ""}
              onChange={(e) =>
                setCurrentClient({ ...currentClient, phone_number: e.target.value })
              }
            />

            <Label htmlFor="location" className="mt-2">Location</Label>
            <Input
              type="text"
              id="location"
              value={currentClient?.location || ""}
              onChange={(e) =>
                setCurrentClient({ ...currentClient, location: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (currentClient) {
                  const { error } = await supabase
                    .from("clients")
                    .update({
                      name: currentClient.name,
                      client_name: currentClient.client_name,
                      company_name: currentClient.company_name,
                      phone_number: currentClient.phone_number,
                      location: currentClient.location,
                    })
                    .eq("id", currentClient.id);
                  if (error) {
                    console.error("Error updating client:", error);
                  } else {
                    fetchClients();
                    setIsEditDialogOpen(false);
                    setCurrentClient(null);
                  }
                }
              }}
            >
              Save Changes
            </Button>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
