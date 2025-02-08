'use client';
import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Dropzone } from '@/components/ui/dropzone';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface ShowData {
  title: string;
  category: string;
  scheduled_time: string;
}

export default function CreateShowForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('music');
  const [scheduled_time, setScheduledTime] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Handler for Dropzone file changes:
  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check if a thumbnail file is uploaded
    if (!file) {
      console.error('No thumbnail uploaded!');
      return;
    }

    const showData: ShowData = {
      title,
      category,
      scheduled_time,
    };

    const token = localStorage.getItem('authToken');

    const formData = new FormData();
    formData.append('show', JSON.stringify(showData));
    formData.append('thumbnail', file);
    formData.append('token', token || '');

    try {
      await axios.post('/api/show', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push('/manage-show');
    } catch (error) {
      console.error('Error creating show:', error);
      // TODO: Display an error message to the user.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="grid lg:pr-10 gap-6">
          <div className="space-y-6">
            <FormSection title="Thumbnail">
              <Dropzone
                className="h-48"
                fileExtensions={['png', 'jpg', 'jpeg', 'gif', 'webp']}
                onChange={handleFileChange}
              />
            </FormSection>
          </div>

          <div className="space-y-6">
            <FormSection title="Show Details">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Show title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trading_card_games">
                        Trading Card Games
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    placeholder="Select date and time"
                    value={scheduled_time}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </FormSection>
          </div>
        </div>

        <div>
          <Button
            className="bg-green-300 text-black font-bold rounded-full lg:text-lg lg:px-6 lg:py-6"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
