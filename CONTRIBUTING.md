This file contains guidelines that should be followed when making any
changes to the repository. All text before the first level 1 (L1) header
will be ignored by the Pull request guidelines add-on.

# Guidelines for component development

## All the subscriptions need to be unsubscribed by implementing OnDestroy for each component
## Change detection strategy to be set to OnPush for each component

# Guidelines for HTML Templates

## Templates should reference only public functions. In case of private variable we need to write get accessor to access it.

# Naming conventions and structured code

## All the file paths (folders and files) should be in lower case

# State & reducers

## In reducers, we need to close object in state before making changes to it

# Effects

## Each effect should catch errors and handle them appropriately (dispatch error action with proper params)

Massages are formed in this way. 

[Info] Updating task <b>XYZ Task..</b>
[Success] Task <b>XYZ Task..</b> updated successfully
[Error] An error occured while updating task <b>XYZ Task..</b>

[Info] Creating task <b>XYZ Task..</b>
[Success] Task <b>XYZ Task..</b> created successfully
[Error] An error occured while creating task <b>XYZ Task..</b>

[Info] Removing task <b>XYZ Task..</b>
[Success] Task <b>XYZ Task..</b> removed successfully
[Error] An error occured while removing task <b>XYZ Task..</b>

[Info] Copying task <b>XYZ Task..</b>
[Success] Task <b>XYZ Task..</b> copied successfully
[Error] An error occured while copying task <b>XYZ Task..</b>

[Info] Distributing task <b>XYZ Task..</b>
[Success] Task <b>XYZ Task..</b> distributed successfully
[Error] An error occured while distributing task <b>XYZ Task..</b>

[Error] An error occured while loading task categories

## Snackbar messages should use the same unique code (for Inprogress/Complete/Error) within each effect 
