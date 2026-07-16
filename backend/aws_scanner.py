import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

def scan_aws_resources(region: str = "us-east-1"):
    try:
        # Initialize Boto3 clients
        ec2_client = boto3.client('ec2', region_name=region)
        
        resources = []

        # 1. Scan EC2 Instances
        instances_response = ec2_client.describe_instances()
        for reservation in instances_response.get('Reservations', []):
            for instance in reservation.get('Instances', []):
                # Safely extract instance name from tags
                name_tag = next((tag['Value'] for tag in instance.get('Tags', []) if tag['Key'] == 'Name'), 'Unnamed')
                
                resources.append({
                    "id": instance['InstanceId'],
                    "type": "EC2 Instance",
                    "name": name_tag,
                    "state": instance['State']['Name'],
                    "launch_time": instance['LaunchTime'].strftime("%Y-%m-%d %H:%M:%S"),
                    "details": f"Type: {instance['InstanceType']}"
                })

        # 2. Scan EBS Volumes (Look for unattached, orphaned volumes bleeding money)
        volumes_response = ec2_client.describe_volumes()
        for volume in volumes_response.get('Volumes', []):
            name_tag = next((tag['Value'] for tag in volume.get('Tags', []) if tag['Key'] == 'Name'), 'Unnamed Volume')
            state = volume['State']
            attachments = volume.get('Attachments', [])
            
            # Highlight attachment status
            status = "Attached" if attachments else "Unattached (Wasting Cost!)"
            
            resources.append({
                "id": volume['VolumeId'],
                "type": "EBS Volume",
                "name": name_tag,
                "state": f"{state} ({status})",
                "launch_time": volume['CreateTime'].strftime("%Y-%m-%d %H:%M:%S"),
                "details": f"Size: {volume['Size']} GiB | Type: {volume['VolumeType']}"
            })
        # --- TEST DATA INJECTION ---
        # If the account is empty, add a fake expensive resource so we can test the UI and AI
        if not resources:
            resources.append({
                "id": "vol-0abcd1234efgh5678",
                "type": "EBS Volume",
                "name": "Forgotten-Database-Backup",
                "state": "available (Unattached)",
                "launch_time": "2024-01-15 08:00:00",
                "details": "Size: 500 GiB | Type: io1 (Highly Expensive!)"
            })
        # ---------------------------

        return {"status": "success", "region": region, "resources": resources}

    except (NoCredentialsError, PartialCredentialsError):
        return {"status": "error", "message": "AWS Credentials not found or incomplete."}
    except Exception as e:
        return {"status": "error", "message": str(e)}