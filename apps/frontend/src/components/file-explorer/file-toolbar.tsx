"use client"

import { Button } from "@/components/ui/button"
import { 
  FolderPlus, 
  Upload, 
  Grid2x2, 
  List 
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function FileToolbar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Select defaultValue="grid">
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">
              <div className="flex items-center">
                <Grid2x2 className="h-4 w-4 mr-2" />
                Grid
              </div>
            </SelectItem>
            <SelectItem value="list">
              <div className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                List
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}