# How to create a new windows7 VM from template
```bash
# Copy VM template Win7Pro_Eris.ova to the virtualbox
scp Win7Pro_Eris.ova.gz eris.managination.com:~/
# Login to VM host
ssh eris.managination.com
# Import VM
VBoxManage import Win7Pro_Eris.ova
# Insert installation CD
VBoxManage storageattach "Win7Pro_Eris" --storagectl SATA --port 1 --device 0 --type dvddrive --medium /home/mroon/Win7_Pro_SP1_English_COEM_x64.iso
# Turn on VRDE (RDP server for KVM feature)
VBoxManage modifyvm Win7Pro_Eris --vrde on
# start VM
VBoxManage startvm Win7Pro_Eris --type headless
```
Use eris.managination.com:3389 as connection string for your RDP client.

# How to configure Remote Desktop Access
To configure remote access, follow these steps:

1. In Control Panel, click System And Security, and then click System.
2. On the System page, click Remote Settings in the left pane. This opens the System Properties dialog box to the Remote tab.
3. To disable Remote Desktop, select Don’t Allow Connections To This Com¬puter, and then click OK.Skip the remaining steps.
4. To enable Remote Desktop, you have two options. You can:
    - Select Allow Connections From Computers Running Any Version Of Remote Desktop to allow connections from any version of Windows.
    - Select Allow Connections Only From Computers Running Remote Desktop With Network Level Authentication to allow connections only from Windows 7 or later computers (and computers with secure network authentication).
5. Click Select Users. This displays the Remote Desktop Users dialog box.
6. To grant Remote Desktop access to a user, click Add. This opens the Select Users dialog box. In the Select Users dialog box, click Locations to select the computer or domain in which the users you want to work with are located. Type the name of a user you want to work with in the Enter The Object Names To Select field, and then click Check Names. If matches are found, select the account you want to use and then click OK. If no matches are found, update the name you entered and try searching again. Repeat this step as necessary, and then click OK.
7. To revoke remote access permissions for a user account, select the account and then click Remove.
8. Click OK twice when you have finished. 

# How to shutdow the VM
## Normal shutdown (like if you have pressed power button)
```bash
VBoxManage controlvm Win7Pro_Eris acpipowerbutton
```
## Poweroff (like if you pull out the power plug out of socket)
```bash
VBoxManage controlvm Win7Pro_Eris poweroff
```
# How to get the list of VM instances
```bash
# all VMs
VBoxManage list vms 
# only running VMs
VBoxManage list runningvms
```
