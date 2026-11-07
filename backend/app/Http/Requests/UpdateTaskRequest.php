<?php

namespace App\Http\Requests;

use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->user();

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'required', Rule::enum(TaskStatus::class)],
            'assigned_to' => $user->isAdmin()
                ? ['sometimes', 'required', 'integer', 'exists:users,id']
                : ['sometimes', 'required', 'integer', Rule::in([$user->id])],
            'due_date' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
        ];
    }
}
