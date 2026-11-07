<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
        ]);

        $alice = User::factory()->create([
            'name' => 'Alice',
            'email' => 'alice@example.com',
        ]);

        $bob = User::factory()->create([
            'name' => 'Bob',
            'email' => 'bob@example.com',
        ]);

        foreach ([$admin, $alice, $bob] as $user) {
            Task::factory()->count(8)->for($user, 'assignee')->create();
        }
    }
}
