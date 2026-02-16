#!/usr/bin/env bash
set -e

echo "Waiting for Keycloak to start..."

until /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user "$KEYCLOAK_ADMIN" \
  --password "$KEYCLOAK_ADMIN_PASSWORD" > /dev/null 2>&1
do
  sleep 3
done

echo "Authenticated with kcadm."

REALM="${REACT_REALM:-react-realm}"

create_user() {
  USERNAME=$1
  PASSWORD=$2
  EMAIL=$3

  echo "Checking if user $USERNAME exists..."

  if /opt/keycloak/bin/kcadm.sh get users -r "$REALM" -q username="$USERNAME" | grep -q "$USERNAME"; then
    echo "User $USERNAME already exists."
  else
    echo "Creating user $USERNAME..."

    /opt/keycloak/bin/kcadm.sh create users -r "$REALM" \
      -s username="$USERNAME" \
      -s enabled=true \
      -s email="$EMAIL" \
      -s emailVerified=true

    USER_ID=$(/opt/keycloak/bin/kcadm.sh get users -r "$REALM" -q username="$USERNAME" --fields id --format csv | tail -n1)

    echo "Setting password for $USERNAME..."

    /opt/keycloak/bin/kcadm.sh set-password -r "$REALM" \
      --userid "$USER_ID" \
      --new-password "$PASSWORD"
  fi
}

create_user "$REACT_APP_USER" "$REACT_APP_USER_PASSWORD" "$REACT_APP_USER_EMAIL"
create_user "$REACT_ADMIN_USER" "$REACT_ADMIN_USER_PASSWORD" "$REACT_ADMIN_USER_EMAIL"

echo "User setup complete."