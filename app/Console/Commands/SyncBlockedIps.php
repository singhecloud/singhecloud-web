<?php

namespace App\Console\Commands;

use App\Models\BlockedIp;
use Illuminate\Console\Command;

class SyncBlockedIps extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-blocked-ips';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync blocked IPs to iptables';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting blocked IPs sync...');

        // Fetch all blocked IPs from database
        $blockedIps = BlockedIp::pluck('ip')->toArray();

        // Flush old rules (remove any previously added DROP rules)
        $this->info('Flushing old rules...');
        exec("sudo iptables -F BLOCKED_IPS || true");

        // Create custom chain if not exists (useful when no custom chain exists)
        exec("sudo iptables -N BLOCKED_IPS 2>/dev/null || true");

        // Remove the previous chain jump and re-add it
        exec("sudo iptables -D INPUT -j BLOCKED_IPS 2>/dev/null || true");
        exec("sudo iptables -I INPUT -j BLOCKED_IPS");

        // Get the list of currently blocked IPs in the BLOCKED_IPS chain
        $currentBlockedIps = [];
        $output = [];
        exec("sudo iptables -L BLOCKED_IPS -n -v --line-numbers", $output);

        // Parse the output to extract current blocked IPs (if any)
        foreach ($output as $line) {
            if (preg_match('/(\d+\.\d+\.\d+\.\d+)/', $line, $matches)) {
                $currentBlockedIps[] = $matches[0];
            }
        }

        // Find IPs to remove (those that are no longer in the database)
        $ipsToRemove = array_diff($currentBlockedIps, $blockedIps);
        foreach ($ipsToRemove as $ip) {
            $this->info("Removing IP from iptables: {$ip}");
            exec("sudo iptables -D BLOCKED_IPS -s {$ip} -j DROP");
        }

        // Add new DROP rules for each blocked IP
        foreach ($blockedIps as $ip) {
            $this->info("Blocking IP: {$ip}");
            exec("sudo iptables -A BLOCKED_IPS -s {$ip} -j DROP");
        }

        $this->info('Blocked IPs sync completed!');
        return 0;
    }
}
