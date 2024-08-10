import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast, Toaster } from "sonner";
import { Edit, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [stages, setStages] = useState({
    New: [],
    Contacted: [],
    Qualified: [],
    Proposal: [],
    Won: [],
    Lost: [],
  });
  const [expanded, setExpanded] = useState(Object.keys(stages));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    company_name: "",
    phone_number: "",
    location: "",
    client_name: "",
    stage: "New",
  });
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*");
    const groupedClients = {
      New: [],
      Contacted: [],
      Qualified: [],
      Proposal: [],
      Won: [],
      Lost: [],
    };
    data.forEach((client) => {
      groupedClients[client.stage].push(client);
    });
    setClients(data);
    setStages(groupedClients);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    const newStages = { ...stages };
    const [movedClient] = newStages[sourceStage].splice(source.index, 1);
    movedClient.stage = destStage;
    newStages[destStage].splice(destination.index, 0, movedClient);

    setStages(newStages);

    // Update stage in database
    await updateClientStage(movedClient.id, destStage);
    toast.success("Client stage updated successfully");
  };

  const updateClientStage = async (clientId, newStage) => {
    await supabase
      .from("clients")
      .update({ stage: newStage })
      .eq("id", clientId);
  };

  const handleAddDialogOpen = () => {
    setIsAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    setNewClient({
      name: "",
      company_name: "",
      phone_number: "",
      location: "",
      client_name: "",
      stage: "New",
    });
  };

  const handleEditDialogOpen = (client) => {
    setEditingClient(client);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingClient(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingClient) {
      setEditingClient({ ...editingClient, [name]: value });
    } else {
      setNewClient({ ...newClient, [name]: value });
    }
  };

  const handleAddClient = async () => {
    const { error } = await supabase.from("clients").insert([newClient]);
    if (error) {
      console.error("Error adding client:", error);
      toast.error("Failed to add client");
    } else {
      fetchClients();
      handleAddDialogClose();
      toast.success("Client added successfully");
    }
  };

  const handleEditClient = async () => {
    const { error } = await supabase
      .from("clients")
      .update(editingClient)
      .eq("id", editingClient.id);
    if (error) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client");
    } else {
      fetchClients();
      handleEditDialogClose();
      toast.success("Client updated successfully");
    }
  };

  const handleDeleteClient = async (clientId) => {
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);
    if (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    } else {
      fetchClients();
      toast.success("Client deleted successfully");
    }
  };

  const getTextColorClass = (stage) => {
    switch (stage) {
      case "New":
        return "text-yellow-600";
      case "Contacted":
        return "text-blue-600";
      case "Qualified":
        return "text-green-600";
      case "Proposal":
        return "text-purple-600";
      case "Won":
        return "text-teal-600";
      case "Lost":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const toggleExpand = (stage) => {
    if (expanded.includes(stage)) {
      setExpanded(expanded.filter((s) => s !== stage));
    } else {
      setExpanded([...expanded, stage]);
    }
  };

  const getCardWidth = (stage) => {
    return expanded.includes(stage) ? "w-[240px]" : "w-[100px]";
  };

  const calculateContainerWidth = () => {
    return `${expanded.length * 300 + (Object.keys(stages).length - expanded.length) * 100}px`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <Card className="flex px-1 pt-4 flex-col min-h-screen bg-gray-100">
        <div className="flex px-4 items-center space-x-4">
          <Input placeholder="Search clients" className="mr-4" />
          <Button onClick={handleAddDialogOpen}>Add New Client</Button>
        </div>

        <div className="flex flex-grow w-full p-4 overflow-x-auto" style={{ width: calculateContainerWidth() }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {Object.keys(stages).map((stage) => (
              <Droppable key={stage} droppableId={stage}>
                {(provided) => (
                  <Card
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex flex-col transition-all duration-300 ease-in-out ${getCardWidth(
                      stage
                    )} bg-white ${getTextColorClass(stage)} border border-gray-300 p-4 rounded-lg shadow-md relative cursor-pointer`}
                  >
                    {expanded.includes(stage) ? (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <h2 className={`text-lg font-semibold truncate ${getTextColorClass(stage)}`}>
                            {stage}
                          </h2>
                          <button
                            className="text-gray-500 transform rotate-90"
                            onClick={() => toggleExpand(stage)}
                          >
                            <ChevronRight />
                          </button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                          {stages[stage].length > 0 ? (
                            stages[stage].map((client, index) => (
                              <Draggable
                                key={client.id}
                                draggableId={client.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <Card className="mb-2">
                                      <CardHeader>
                                        <CardTitle>{client.client_name}</CardTitle>
                                        <CardDescription>{client.company_name}</CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                        <p>{client.name}</p>
                                        <p>{client.phone_number}</p>
                                        <p>{client.location}</p>
                                      </CardContent>
                                      <CardFooter className="flex justify-end space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleEditDialogOpen(client)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>
                                                Are you sure you want to delete this client?
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() =>
                                                  handleDeleteClient(client.id)
                                                }
                                              >
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </CardFooter>
                                    </Card>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                              <p className="mb-2">No clients</p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="transform -rotate-90 whitespace-nowrap">
                          <p className={`text-sm font-semibold text-center ${getTextColorClass(stage)}`}>
                            {stage}
                          </p>
                        </div>
                        <button
                          className="absolute top-2 right-2 text-gray-500"
                          onClick={() => toggleExpand(stage)}
                        >
                          <ChevronLeft />
                        </button>
                      </div>
                    )}
                    {provided.placeholder}
                  </Card>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </div>
      </Card>

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              name="name"
              value={newClient.name}
              onChange={handleInputChange}
              placeholder="Client Name"
            />
            <Input
              name="company_name"
              value={newClient.company_name}
              onChange={handleInputChange}
              placeholder="Company Name"
            />
            <Input
              name="phone_number"
              value={newClient.phone_number}
              onChange={handleInputChange}
              placeholder="Phone Number"
            />
            <Input
              name="location"
              value={newClient.location}
              onChange={handleInputChange}
              placeholder="Location"
            />
            <Input
              name="client_name"
              value={newClient.client_name}
              onChange={handleInputChange}
              placeholder="Client's Contact Name"
            />
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleAddDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleAddClient}>Add Client</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <div className="space-y-4">
              <Input
                name="name"
                value={editingClient.name}
                onChange={handleInputChange}
                placeholder="Client Name"
              />
              <Input
                name="company_name"
                value={editingClient.company_name}
                onChange={handleInputChange}
                placeholder="Company Name"
              />
              <Input
                name="phone_number"
                value={editingClient.phone_number}
                onChange={handleInputChange}
                placeholder="Phone Number"
              />
              <Input
                name="location"
                value={editingClient.location}
                onChange={handleInputChange}
                placeholder="Location"
              />
              <Input
                name="client_name"
                value={editingClient.client_name}
                onChange={handleInputChange}
                placeholder="Client's Contact Name"
              />
            </div>
          )}
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleEditDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleEditClient}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
