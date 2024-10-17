import { useState } from "react";
import {
    StyledInput,
    StyledInputArea,
} from "../../../components/styled/StyledInput";
import StyledButton from "../../../components/styled/StyledButton";

type EditProfileProp = {
    onCancelClick: () => void;
};

const EditProfileForm = ({ onCancelClick }: EditProfileProp) => {
    const [initialData] = useState({
        displayName: "John SNow",
        bio: "this is a very cool wee",
        skills: ["CSS", "UI/UX", "React", "Something else", "one more thing"],
        links: [
            "https://linkedin.com/someone",
            "https://linkedin.com/someone",
            "https://linkedin.com/someone",
        ],
    });
    const [form, setForm] = useState(initialData);
    const [newSkill, setNewSkill] = useState("");

    const handleInputChange = (name: string, value: string) =>
        setForm({
            ...form,
            [name]: value,
        });
    const removeSkill = (skillToRemove: string, index: number) => {
        setForm({
            ...form,
            skills: form.skills.filter((skill) => skill !== skillToRemove),
        });
    };
    const addSkill = () => {
        if (newSkill.trim()) {
            setForm({
                ...form,
                skills: [...form.skills, newSkill],
            });
            setNewSkill("");
        }
    };

    const handleSaveClick = () => {};
    const handleCancelClick = () => {
        setForm(initialData);
        onCancelClick();
    };

    return (
        <div className="flex flex-col">
            <StyledInput
                type="name"
                placeholder="Enter your display name"
                onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                }
                value={form.displayName}
                className="w-full"
            />
            <StyledInputArea
                placeholder="Enter your Bio"
                onChange={(e) => handleInputChange("bio", e.target.value)}
                value={form.bio}
                className="w-full mt-3"
            />
            <h3 className="font-semibold mt-3">Skills:</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
                {form.skills.map((skill, index) => (
                    <div
                        className="bg-white/20 p-1.5 text-xs rounded-md"
                        key={index}
                    >
                        {skill}
                        <button
                            className="text-red-500 ml-1 cursor-pointer"
                            onClick={() => removeSkill(skill, index)}
                        >
                            &times;
                        </button>
                    </div>
                ))}
                <div className="flex bg-white/20 p-1.5 text-xs rounded-md">
                    <input
                        type="text"
                        placeholder="Add a skill"
                        value={newSkill}
                        className="bg-transparent"
                        onChange={(v) => setNewSkill(v.target.value)}
                    />
                    <button
                        onClick={addSkill}
                        className="cursor-pointer text-white p-1 bg-accent rounded-md"
                    >
                        +
                    </button>
                </div>
            </div>
            <div className="flex flex-row gap-1.5">
                <StyledButton
                    children="Save"
                    variant="success"
                    onClick={handleSaveClick}
                    size="small"
                />
                <StyledButton
                    children="Cancel"
                    variant="outline"
                    onClick={handleCancelClick}
                    size="small"
                />
            </div>
        </div>
    );
};
export default EditProfileForm;
