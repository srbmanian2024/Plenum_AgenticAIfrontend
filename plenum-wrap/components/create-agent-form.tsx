// components/create-agent-form.tsx
'use client'; // This component needs to be a client component

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner'; // For toast notifications
import { Spinner } from './ui/spinner'; // Assuming you have a Spinner component for loading state

// --- Type Definitions ---
// Define the Domain type for the select input
type Domain = {
  id: string;
  name: string;
  description: string;
};

// Define the Agent type for the form payload, matching your API structure precisely
type AgentPayload = {
  name: string;
  endpoint_url: string;
  capabilities: string[];
  supported_languages: string[];
  healthcheck_url: string;
  auth_type: string;
  auth_credentials: string; // This will include "Bearer " prefix + token
  timeout: number;
  description: string;
  vendor_name: string;
  domain_id: string;
  is_active: boolean;
  priority: number;
};

// Props interface for the CreateAgentForm component
interface CreateAgentFormProps {
  domains: Domain[]; // List of available domains to populate the dropdown
  onAgentCreated: () => void; // Callback function to refresh the agents list after successful creation
  onClose: () => void; // Callback function to close the dialog after submission or cancellation
}

export function CreateAgentForm({ domains, onAgentCreated, onClose }: CreateAgentFormProps) {
  // --- Form State Management ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [domainId, setDomainId] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [capabilities, setCapabilities] = useState(''); // Stored as comma-separated string, converted to array on submit
  const [supportedLanguages, setSupportedLanguages] = useState(''); // Stored as comma-separated string, converted to array on submit
  const [healthcheckUrl, setHealthcheckUrl] = useState(''); // New state for healthcheck_url
  const [vendorName, setVendorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // State for loading indicator during submission

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsSubmitting(true); // Set submitting state to true

    // Show a loading toast notification
    const createAgentToastId = toast.loading('Creating agent...', { duration: Infinity });

    // Retrieve authentication token from localStorage
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      toast.error('Authentication token not found. Please log in.', { id: createAgentToastId });
      setIsSubmitting(false);
      return; // Stop submission if no token
    }

    // Basic validation for required fields
    if (!name || !description || !domainId || !endpointUrl || !healthcheckUrl || !vendorName) {
      toast.error('Please fill in all required fields.', { id: createAgentToastId });
      setIsSubmitting(false);
      return; // Stop submission if required fields are missing
    }

    // Construct the payload matching the exact API structure
    const payload: AgentPayload = {
      name,
      description,
      domain_id: domainId,
      endpoint_url: endpointUrl,
      // Split comma-separated strings into arrays and filter out empty strings
      capabilities: capabilities.split(',').map(s => s.trim()).filter(s => s.length > 0),
      supported_languages: supportedLanguages.split(',').map(s => s.trim()).filter(s => s.length > 0),
      healthcheck_url: healthcheckUrl,
      auth_type: 'Bearer', // Fixed value as per API documentation
      auth_credentials: `Bearer ${accessToken}`, // Prepend "Bearer " to the token
      timeout: 10, // Fixed value as per API documentation
      is_active: true, // Fixed value as per API documentation
      priority: 0, // Fixed value as per API documentation
      vendor_name: vendorName,
    };

    // Log the payload to the console before sending for debugging purposes
    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(
        'https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/agents/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Use the accessToken here for the Authorization header
          },
          body: JSON.stringify(payload),
        }
      );

      // Check if the response was successful
      if (!response.ok) {
        // Attempt to parse error details from the response body
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorData.detail || JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      // Log the successful API response to the console
      console.log('✅ Agent created successfully (API response):', result);
      toast.success('Agent created successfully!', { id: createAgentToastId, duration: 3000 }); // Show success toast

      onAgentCreated(); // Call the prop to trigger re-fetching agents in the parent component
      onClose(); // Close the dialog

      // Reset all form fields after successful submission
      setName('');
      setDescription('');
      setDomainId('');
      setEndpointUrl('');
      setCapabilities('');
      setSupportedLanguages('');
      setHealthcheckUrl('');
      setVendorName('');

    } catch (error: any) {
      // Log and display error toast if submission fails
      console.error('❌ Failed to create agent:', error);
      toast.error(`Failed to create agent: ${error.message || String(error)}`, { id: createAgentToastId, duration: 5000 });
    } finally {
      setIsSubmitting(false); // Reset submitting state regardless of success or failure
    }
  };

  return (
    <DialogContent
      // --- IMPORTANT: Fixed the transparent background here ---
      // 'bg-card' provides a solid background color as defined in your global.css for card elements.
      // 'shadow-lg' and 'border' add visual depth.
      className="sm:max-w-[425px] bg-card shadow-lg border"
    >
      <DialogHeader>
        <DialogTitle>Create New Agent</DialogTitle>
        <DialogDescription>
          Fill in the details to create a new agent. All fields are required.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        {/* Name Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-3"
            required // Mark as required
          />
        </div>

        {/* Description Textarea */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="col-span-3"
            required // Mark as required
          />
        </div>

        {/* Domain Select */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="domain" className="text-right">
            Domain
          </Label>
          <Select value={domainId} onValueChange={setDomainId} required>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => (
                <SelectItem key={domain.id} value={domain.id}>
                  {domain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Endpoint URL Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="endpointUrl" className="text-right">
            Endpoint URL
          </Label>
          <Input
            id="endpointUrl"
            type="url" // Use type="url" for URL validation
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            className="col-span-3"
            required // Mark as required
          />
        </div>

        {/* Healthcheck URL Input (New Field) */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="healthcheckUrl" className="text-right">
            Healthcheck URL
          </Label>
          <Input
            id="healthcheckUrl"
            type="url" // Use type="url" for URL validation
            value={healthcheckUrl}
            onChange={(e) => setHealthcheckUrl(e.target.value)}
            className="col-span-3"
            required // Mark as required
          />
        </div>

        {/* Capabilities Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="capabilities" className="text-right">
            Capabilities (comma-sep)
          </Label>
          <Input
            id="capabilities"
            value={capabilities}
            onChange={(e) => setCapabilities(e.target.value)}
            className="col-span-3"
            placeholder="e.g., search, summarize, translate"
          />
        </div>

        {/* Supported Languages Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="supportedLanguages" className="text-right">
            Languages (comma-sep)
          </Label>
          <Input
            id="supportedLanguages"
            value={supportedLanguages}
            onChange={(e) => setSupportedLanguages(e.target.value)}
            className="col-span-3"
            placeholder="e.g., en, es, fr"
          />
        </div>

        {/* Vendor Name Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vendorName" className="text-right">
            Vendor Name
          </Label>
          <Input
            id="vendorName"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="col-span-3"
            required // Mark as required
          />
        </div>

        {/* Dialog Footer with Submit Button */}
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" /> Creating... {/* Show spinner when submitting */}
              </>
            ) : (
              'Create Agent' // Default button text
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}